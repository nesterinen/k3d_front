import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"


import { forwardRef, useEffect, useRef, useImperativeHandle } from 'react'

let camera: THREE.PerspectiveCamera
let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let controls: OrbitControls

let geometry: THREE.BoxGeometry
let material: THREE.MeshNormalMaterial
let mesh: THREE.Mesh

//let geometry, material, mesh

//init()

function init(width = 500, height = 500) {
    console.log(width, height)
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.position.y = 350

    scene = new THREE.Scene()

    geometry = new THREE.BoxGeometry(20, 20, 20)
    material = new THREE.MeshNormalMaterial()

    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.addEventListener('change', render)
    controls.minDistance = 5
    controls.maxDistance = 350
    controls.zoomSpeed = 2
}

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


const PointCloudViewer = forwardRef((_props, ref) => {
    const refContainer = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
        resize(width: number, height: number){
            resize(width, height)
        }
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
        render()
    }, [])

    return (
        <div ref={refContainer}>
        </div>
    )
})

export default PointCloudViewer