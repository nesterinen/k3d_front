import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react'

import { getTif, tif2pcd, pcd2points } from '../../utils/tifUtilities';

// THREE setup ########################################################################
let camera: THREE.PerspectiveCamera
let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let controls: OrbitControls

let pointcloud: THREE.Points

function init(width = 500, height = 500) {
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
    controls.maxDistance = 350
    controls.zoomSpeed = 2
}
// ####################################################################################


// Diagnosis setup ####################################################################
let diagnosisMode = false
let texture: THREE.Texture
const loader = new THREE.TextureLoader()

async function diagnoseOn() {
    if (!texture){  // await because we render AFTER texture is loaded, this is done only once.
        texture = await loader.loadAsync( 'backgrounds/uv_grid_opengl.jpg' )
        texture.mapping = THREE.EquirectangularReflectionMapping
    }
    /*
    if (!axesHelper) {
        axesHelper = new THREE.AxesHelper( 50 )
        axesHelper.layers.set( 1 )  // diagnose layer
        scene.add( axesHelper )
    }
    */
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


// "Global functions" #################################################################
function resize(width: number, height: number) {
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    render()
}

function render() {
    // do not render if not in DOM:
    if (!renderer.domElement.parentNode) return;
    renderer.render(scene, camera)
}

function resetControls() {
    controls.reset()
}
// ####################################################################################


// Main Component #####################################################################
let loadLocal = true  // first render load local .tif file
const PointCloudViewer = forwardRef((_props, ref) => {
    const refContainer = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
        resize(width: number, height: number){
            resize(width, height)
        },

        resetControls(){resetControls()},

        diagnosisModeSwitch(){diagnosisModeSwitch()}
    }))

    useEffect(() => {
        const container = refContainer.current
        
        if (container) {
            if (container?.parentElement){
                init(container.parentElement.clientWidth, container.parentElement.clientHeight)
            }
            container.appendChild(renderer.domElement)
        }

        return () => { // cleanup when component closes
            if (container) container.removeChild(renderer.domElement)
        }
    }, [refContainer])

    useEffect(() => {
        async function loadPointCloud(tifData: ArrayBuffer) {
            if(!tifData) return undefined

            const pcData = tif2pcd(tifData)

            pointcloud = pcd2points(pcData.geometry)

            pointcloud.geometry.center();
            pointcloud.name = 'point_cloud';
            //pointcloud.material.size = 0.8
            pointcloud.geometry.rotateX((Math.PI / 2) * 3) // rotate 90 degreee three times
            pointcloud.geometry.rotateY((Math.PI / 2) * 3) // rotate 90 degreee three times

            scene.add( pointcloud );
        
            render()
        }

        if (loadLocal) {
            getTif('tif/main_test.tif')
                .then(data => {
                    loadPointCloud(data)
                })
        }
    }, [])

    return (
        <div ref={refContainer}>
        </div>
    )
})

export default PointCloudViewer