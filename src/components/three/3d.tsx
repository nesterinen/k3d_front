import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import GUI from 'lil-gui'

import { forwardRef, useEffect, useRef, useImperativeHandle, useContext } from 'react'
import StorageContext from '@/reducers/storageReducer'

import { getTif, pcd2points, arduinoMap, getCoordinate, tif2pcdGradient } from '../../utils/pointCloudUtilities' // tif2pcd
import getTifFile from '../../services/apiService'

// THREE setup ########################################################################
let camera: THREE.PerspectiveCamera
let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let winWidth: number, winHeight: number

// GUI setup
let gui: GUI

//let pointcloud: THREE.Points
let pointcloud: THREE.Points<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.PointsMaterial, THREE.Object3DEventMap>
export interface PCDStats {
    min_value: number,
    max_value: number,
    mean_value: number,
    size: number,
    width: number,
    height: number,
    resolution: number,
    easting: number,
    northing: number,
    cursorNorth: number,
    cursorEast: number,
    elevation: number
}
let pointCloudStats: PCDStats

function init(width = 500, height = 500) {
    winWidth = width
    winHeight = height
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.y = 350
    camera.layers.enable( 0 ) // enabled by default
    camera.layers.enable( 1 ) // used for diagnose mode
    camera.layers.toggle( 1 ) // set to off initially

    scene = new THREE.Scene()

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.addEventListener('change', render)
    controls.minDistance = 5
    controls.maxDistance = 500
    controls.zoomSpeed = 2

    gui = new GUI({autoPlace: false})
    gui.title('Stats')
    gui.close()
}
// ####################################################################################


// Diagnosis setup ####################################################################
let diagnosisMode = false
let texture: THREE.Texture
let loader: THREE.TextureLoader
let axesHelper: THREE.AxesHelper

async function diagnoseOn() {
    if (!texture){  // await because we render AFTER texture is loaded, this is done only once.
        loader = new THREE.TextureLoader()
        texture = await loader.loadAsync( 'backgrounds/uv_grid_opengl.jpg' )
        texture.mapping = THREE.EquirectangularReflectionMapping
    }
    
    if (!axesHelper) {
        axesHelper = new THREE.AxesHelper( 50 )
        axesHelper.layers.set( 1 )  // diagnose layer
        scene.add( axesHelper )
    }
    
    if (diagnosisMode) scene.background = texture
    else scene.background = null
}

async function diagnosisModeSwitch() {
    camera.layers.toggle( 1 )
    diagnosisMode = !diagnosisMode
    await diagnoseOn()
    render()
}
// ####################################################################################


// Raycast setup ######################################################################
let pointer: THREE.Vector2
let raycaster: THREE.Raycaster
let lastControlsAzimuth: number, lastControlsPolar: number
let intersects: THREE.Intersection[]
let pointerSphere: THREE.Mesh | null

function initRaycast() {
    pointer = new THREE.Vector2()
    raycaster = new THREE.Raycaster()
}

function onClickDownEvent(){
    // onClick and drag conflict workaround
    lastControlsAzimuth = controls.getAzimuthalAngle()
    lastControlsPolar = controls.getPolarAngle()
}

import { ActionType } from '@/reducers/storageReducer'
function clickEvent(event: React.MouseEvent<HTMLDivElement, MouseEvent>, callback: React.Dispatch<ActionType>): number | undefined{
    // dont execute if controls angles have changed since onMouseDown={() => onClickDownEvent()}, screen was dragged.
    if (Math.abs(lastControlsAzimuth - controls.getAzimuthalAngle()) >= 0.01 &&
        Math.abs(lastControlsPolar - controls.getPolarAngle()) >= 0.01
    ) {
        return undefined
    }

    const rect = renderer.domElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    pointer.x = ( x / winWidth ) *  2 - 1;
    pointer.y = ( y / winHeight ) * - 2 + 1

    raycaster.setFromCamera( pointer, camera );
    intersects = raycaster.intersectObject( pointcloud );

    if (diagnosisMode) drawRay(raycaster)

    let elevation = undefined
    if (intersects.length > 0) {
        // elevation(meters) at intersercts, linearly scaled from geometry values -> real values
        const selectedz = intersects[0].point.y
        const bmaxz = pointcloud.geometry.boundingBox!.max.y
        const bminz = pointcloud.geometry.boundingBox!.min.y
        elevation = arduinoMap(selectedz, bminz, bmaxz, pointCloudStats.min_value, pointCloudStats.max_value)
        drawPointerSphere(intersects[0].point)

        // get easting northing
        const enCoords = getCoordinate(
            intersects[0].point.x,
            intersects[0].point.z,
            pointCloudStats.easting,
            pointCloudStats.northing,
            pointCloudStats.width,
            pointCloudStats.height,
            pointCloudStats.resolution
        )

        pointCloudStats.cursorEast = enCoords.easting
        pointCloudStats.cursorNorth = enCoords.northing
        pointCloudStats.elevation = elevation

        gui.controllers.map(controller => {
            controller.object = pointCloudStats
            controller.updateDisplay()
        })

        callback({type: 'SET_STATS', payload:{stats: pointCloudStats}})
    }

    render()

    return elevation
}

function drawPointerSphere(position: THREE.Vector3) {
    if (!pointerSphere) {
        const geometry = new THREE.SphereGeometry(5, 16, 8)
        const material = new THREE.MeshBasicMaterial({ color: 0xd4180b })
        pointerSphere = new THREE.Mesh(geometry, material)
        pointerSphere.name = 'pointerSphere'
        // pointerSphere.layers.set(1)??
        scene.add(pointerSphere)
    }

    pointerSphere.position.set(position.x, position.y, position.z)
}

function drawRay(raycaster: THREE.Raycaster) {
    // Remove the previous line if it exists
    const prevLine = scene.getObjectByName("rayLine");
    if (prevLine) {
        scene.remove(prevLine);
    }

    // The raycaster.ray contains the origin and direction
    const origin = raycaster.ray.origin;
    const direction = raycaster.ray.direction
        .clone()
        .multiplyScalar(1000); // Extend the direction
    const end = origin.clone().add(direction);

    const geometry = new THREE.BufferGeometry().setFromPoints(
        [origin, end]
    );
    const material = new THREE.LineBasicMaterial({
        color: 0xff0000, // Make it RED
    });
    const line = new THREE.Line(geometry, material);
    line.name = "rayLine"; // Name the line for easy reference
    line.layers.set(1)

    scene.add(line);
}
// ####################################################################################


// "Global functions" #################################################################
function resize(width: number | undefined, height: number | undefined) {
    if (width && height) {
        winHeight = height
        winWidth = width
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height)
        render()
    }
}

function render() {
    // do not render if not in DOM:
    if (!renderer.domElement.parentNode) return;
    renderer.render(scene, camera)
}

function resetControls() {
    controls.reset()
    if (pointerSphere) {
        scene.remove(pointerSphere)
        pointerSphere = null
    }
    render()
}
// ####################################################################################


// "Local functions" ##################################################################
function loadPointCloud(tifData: ArrayBuffer) {
    if(!tifData) return undefined

    //const pcData = tif2pcd(tifData)
    const pcData = tif2pcdGradient(tifData)

    pointcloud = pcd2points(pcData.geometry)
    //pointcloud = pcd2points(pcData.geometry, pcData.data.width, pcData.data.height, pcData.data.min_value)
    pointCloudStats = {...pcData.data, cursorEast:0, cursorNorth:0, elevation:0}

    // move to other function?
    if (gui.controllers.length === 0) {
        gui.add(pointCloudStats, 'min_value').disable().name('Lowest (m)')
        gui.add(pointCloudStats, 'max_value').disable().name('Highest (m)')
        gui.add(pointCloudStats, 'mean_value').disable().name('Mean (m)')
        gui.add(pointCloudStats, 'width').disable().name('Width (px)')
        gui.add(pointCloudStats, 'height').disable().name('Height (px)')
        gui.add(pointCloudStats, 'resolution').disable().name('(m) per (px)')
        gui.add(pointCloudStats, 'elevation').disable().name('Cursor elevation (m)')
        gui.add(pointCloudStats, 'cursorEast').disable().name('Cursor easting')
        gui.add(pointCloudStats, 'cursorNorth').disable().name('Cursor northing')
    } else {
        gui.controllers.map(controller => {
            controller.object = pointCloudStats
            controller.updateDisplay()
        })
    }

    pointcloud.name = 'point_cloud';

    type PointCloudType = THREE.Points<THREE.BufferGeometry<THREE.NormalBufferAttributes>, THREE.PointsMaterial, THREE.Object3DEventMap> | null
    let oldPointCloud = scene.getObjectByName('point_cloud') as PointCloudType
    if(oldPointCloud){
        // this has to be done to manage memory.
        oldPointCloud.geometry.dispose()
        oldPointCloud.material.dispose()
        scene.remove(oldPointCloud)
        oldPointCloud = null

        pointcloud.material.size = 2
        pointcloud.geometry.center() // center is slow but will do for now.
        scene.add(pointcloud)
    } else {
        pointcloud.material.size = 2
        pointcloud.geometry.center() // center is slow but will do for now.
        scene.add(pointcloud)
    }

    //pointcloud.material.size = 2
    //pointcloud.geometry.center() // center is slow but will do for now.

    /*
    pointcloud.geometry.center();
    pointcloud.geometry.rotateX((Math.PI / 2) * 3) // rotate 90 degreee three times
    pointcloud.geometry.rotateY((Math.PI / 2) * 3) // rotate 90 degreee three times

    */
    //scene.add( pointcloud );

    render()
}

/* removing and other clean up is done in loadPointCloudData for now.
function removePointCloud() {
    const object = scene.getObjectByName('point_cloud')
    scene.remove(object!)
}
*/

function getPointCloudFromApi(latitude: number, longitude: number, size: number, callback: () => void) {
    console.log('FETCHING')
    getTifFile(latitude, longitude, size)
        .then(data => {
            //removePointCloud()
            loadPointCloud(data)
            callback()
        })
        .catch(error => {
            console.log('getPointCloudFromApi:', error)
            callback()
        })
}

// ####################################################################################


// Main Component #####################################################################
const PointCloudViewer = forwardRef((_props, ref) => {
    const refContainer = useRef<HTMLDivElement>(null)
    const [, dispatch] = useContext(StorageContext)

    useImperativeHandle(ref, () => ({
        resize(width: number, height: number){
            resize(width, height)
        },

        resize2(){
            resize(refContainer.current?.parentElement?.clientWidth, refContainer.current?.parentElement?.clientHeight)
        },

        resetControls(){resetControls()},

        diagnosisModeSwitch(){diagnosisModeSwitch()},

        getPointCloudFromApi(latitude: number, longitude: number, size: number,  callback: () => void){
            getPointCloudFromApi(latitude, longitude, size, callback)
        }
    }))

    useEffect(() => {
        const container = refContainer.current
        
        if (container) {
            if (container.parentElement) {
                init(container.parentElement.clientWidth, container.parentElement.clientHeight)
                initRaycast()
            }

            container.appendChild(renderer.domElement)

            // attach gui to container
            container.getElementsByClassName("gui_container")[0].appendChild(gui.domElement)

            if (window) {
                window.addEventListener('resize', () => resize(container.parentElement?.clientWidth, container.parentElement?.clientHeight))
            }
        }

        return () => { // cleanup when component closes
            if (container) container.getElementsByClassName("gui_container")[0].removeChild(gui.domElement)
            if (container) container.removeChild(renderer.domElement)
            if (window) window.removeEventListener('resize', () => resize)
        }
    }, [refContainer])

    useEffect(() => {
        getTif('tif/main_test.tif')
            .then(data => {
                loadPointCloud(data)
            })
    }, [])

    return (
        <div ref={refContainer}
            onClick={(event) => clickEvent(event, dispatch)}
            onMouseDown={() => onClickDownEvent()}
        >
            <div className="gui_container" style={{position: 'absolute'}}></div>
        </div>
    )
})

export default PointCloudViewer