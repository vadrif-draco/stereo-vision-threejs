import * as dat from 'dat.gui'
import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/MapControls'

const START_POS = [450, 600, 1250]
const START_TARGET = [450, -150, 350]

let pos = START_POS
let target = START_TARGET

const VIEW1_POS = [40, 100, 850]
const VIEW1_TARGET = [360, 100, 420]
const VIEW1_PLANE_ROT = [0, -0.64, 0] // In radians
const VIEW1_PLANE_POS = [140, 100, 700]

const VIEW2_POS = [180, 100, 960]
const VIEW2_TARGET = [500, 100, 530]
const VIEW2_PLANE_ROT = [0, -0.64, 0] // In radians
const VIEW2_PLANE_POS = [290, 100, 815]

const VIEW3_POS = [1150, 100, 550]
const VIEW3_TARGET = [750, 100, 550]
const VIEW3_PLANE_ROT = [0, 1.60, -0.60] // In radians
const VIEW3_PLANE_POS = [965, 100, 550]

const SPHERE1_POS = [600, 100, 300]
const SPHERE2_POS = [550, 100, 350]
const SPHERE3_POS = [500, 100, 400]
const SPHERE4_POS = [380, 20, 280]

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 20, 20000)

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
window.addEventListener('resize', onWindowResize)

const controls = new MapControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.1
controls.maxDistance = 1500
controls.enablePan = false
controls.enableRotate = false
controls.enableZoom = false

const viewControls = {
    freeroam: false,
    viewTilt: 0.0,
    animSpeed: 1.0,
    c: () => {
        console.log(
            "Rotation: " + controls.object.rotation.toArray()
            + "\nPosition: " + controls.object.position.toArray()
            + "\nTarget: " + controls.target.toArray()
        )
    },
    v1: () => {
        pos = VIEW1_POS
        target = VIEW1_TARGET
        setFreeroam(viewControls.freeroam = false)
        // setTimeout(() => { viewControls.viewTilt = 0.0 }, 1000)
    },
    v2: () => {
        pos = VIEW2_POS
        target = VIEW2_TARGET
        setFreeroam(viewControls.freeroam = false)
        // setTimeout(() => { viewControls.viewTilt = 0.0 }, 1000)
    },
    v3: () => {
        pos = VIEW3_POS
        target = VIEW3_TARGET
        setFreeroam(viewControls.freeroam = false)
        // setTimeout(() => { viewControls.viewTilt = -70.0 }, 1000)
    },
    r: () => {
        pos = START_POS
        target = START_TARGET
        viewControls.viewTilt = 0.0
        setFreeroam(viewControls.freeroam = false)
    },
}

const gui = new dat.GUI({ width: 300 })
gui.add(viewControls, 'c').name('console.log -- for debugging purposes')
gui.add(viewControls, 'v1').name('Switch to view 1')
gui.add(viewControls, 'v2').name('Switch to view 2')
gui.add(viewControls, 'v3').name('Switch to view 3')
gui.add(viewControls, 'viewTilt', -100, 100, 5).name("Tilt view").listen().domElement.classList += " special_red"
gui.add(viewControls, 'r').name('Reset view')
gui.add(viewControls, 'animSpeed', 0.5, 2.5, 0.1).name("Animation speed")
gui.add(viewControls, 'freeroam').name('Toggle freeroam').onChange(setFreeroam).listen()

const axesHelper = new THREE.AxesHelper(100000)

const ambLight = new THREE.AmbientLight(0xffffff, 50)

const dirLight = new THREE.DirectionalLight(0xffffff, 50, 0, 0.5)
dirLight.position.set(-100, 400, 100)

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100000, 100000),
    new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
)
ground.rotation.x = -0.5 * Math.PI
ground.position.x = 50000
ground.position.z = 50000

const scene = new THREE.Scene()
scene.add(
    ambLight, dirLight, axesHelper, ground,
    createNewSphere(...SPHERE1_POS, 20, 0xEB9109),
    createNewSphere(...SPHERE2_POS, 20, 0xEB9109),
    createNewSphere(...SPHERE3_POS, 20, 0xEB9109),
    createNewSphere(...SPHERE4_POS, 20, 0xEB9109),
    createNewSphere(...VIEW1_POS, 10, 0xD0F9D6),
    createNewSphere(...VIEW2_POS, 10, 0xCED0FF),
    createNewSphere(...VIEW3_POS, 10, 0xFFB9B9),
    createNewLine(...VIEW1_POS, ...SPHERE1_POS, 0xD0F9D6),
    // Same ray since these spheres are collinear w.r.t view1
    // createNewLine(...VIEW1_POS, ...SPHERE2_POS, 0xD0F9D6),
    // createNewLine(...VIEW1_POS, ...SPHERE3_POS, 0xD0F9D6),
    createNewLine(...VIEW1_POS, ...SPHERE4_POS, 0xD0F9D6),
    createNewLine(...VIEW2_POS, ...SPHERE1_POS, 0xCED0FF),
    createNewLine(...VIEW2_POS, ...SPHERE2_POS, 0xCED0FF),
    createNewLine(...VIEW2_POS, ...SPHERE3_POS, 0xCED0FF),
    createNewLine(...VIEW2_POS, ...SPHERE4_POS, 0xCED0FF),
    createNewLine(...VIEW3_POS, ...SPHERE1_POS, 0xFFB9B9),
    createNewLine(...VIEW3_POS, ...SPHERE2_POS, 0xFFB9B9),
    createNewLine(...VIEW3_POS, ...SPHERE3_POS, 0xFFB9B9),
    createNewLine(...VIEW3_POS, ...SPHERE4_POS, 0xFFB9B9),
    createNewPlane(...VIEW1_PLANE_POS, ...VIEW1_PLANE_ROT, 0xD0F9D6),
    createNewPlane(...VIEW2_PLANE_POS, ...VIEW2_PLANE_ROT, 0xCED0FF),
    createNewPlane(...VIEW3_PLANE_POS, ...VIEW3_PLANE_ROT, 0xFFB9B9),
).fog = new THREE.Fog(0x191919, 1000, 5000)

animate()

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function setFreeroam(enabled) {
    controls.enablePan = controls.enableRotate = controls.enableZoom = enabled
}

function createNewSphere(x, y, z, radius, color) {
    let sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 64, 64),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.2, metalness: 0.99 })
    )
    sphere.position.set(x, y, z)
    return sphere
}

function createNewPlane(x, y, z, rotX, rotY, rotZ, color) {
    let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(180, 120),
        new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
    )
    plane.rotation.set(rotX, rotY, rotZ)
    plane.position.set(x, y, z)
    return plane
}

function createNewLine(x1, y1, z1, x2, y2, z2, color) {
    return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x1, y1, z1),
            new THREE.Vector3(x2, y2, z2),
        ]),
        new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.2 })
    )
}

function animate() {
    requestAnimationFrame(animate)
    controls.update()
    if (!viewControls.freeroam) {
        controls.object.position.lerp(new THREE.Vector3(...pos), 0.04 * viewControls.animSpeed)
        controls.target.lerp(new THREE.Vector3(...target), 0.04 * viewControls.animSpeed)
    }
    controls.object.up.lerp(new THREE.Vector3(viewControls.viewTilt / 100, 1, viewControls.viewTilt / 100), 0.05)
    renderer.render(scene, camera)
}
