import * as dat from 'dat.gui'
import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/MapControls'

const START_POS = new THREE.Vector3(450, 600, 1250)
const START_TARGET = new THREE.Vector3(450, -150, 350)

let cameraPos = START_POS
let cameraTarget = START_TARGET

const SPHERE1_POS = new THREE.Vector3(600, 100, 300)
const SPHERE2_POS = new THREE.Vector3(550, 100, 350)
const SPHERE3_POS = new THREE.Vector3(500, 100, 400)
const SPHERE4_POS = new THREE.Vector3(380, 20, 280)

const VIEW1_POS = new THREE.Vector3(40, 100, 850)
const VIEW1_TARGET = new THREE.Vector3(360, 100, 420)

const VIEW2_POS = new THREE.Vector3(240, 100, 1000)
const VIEW2_TARGET = new THREE.Vector3(550, 100, 570)

const VIEW3_POS = new THREE.Vector3(930, 100, 900)
const VIEW3_TARGET = new THREE.Vector3(630, 100, 450)

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 20, 100000)

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
window.addEventListener('resize', onWindowResize)

const axesHelper = new THREE.AxesHelper(100000)

const ambLight = new THREE.AmbientLight(0xffffff, 50)

const dirLight = new THREE.DirectionalLight(0xffffff, 50, 0, 0.5)
dirLight.position.set(-100, 400, 100)

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100000, 100000),
    new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
)
ground.rotation.x = THREE.MathUtils.degToRad(-90)
ground.position.x = 50000
ground.position.z = 50000

const epipolarPlane12 = createNewEpipolarPlane(VIEW1_POS, VIEW2_POS, SPHERE1_POS)
const epipolarPlane13 = createNewEpipolarPlane(VIEW1_POS, VIEW3_POS, SPHERE1_POS)
const epipolarPlane23 = createNewEpipolarPlane(VIEW2_POS, VIEW3_POS, SPHERE1_POS)
epipolarPlane12.visible = false
epipolarPlane13.visible = false
epipolarPlane23.visible = false

const sphere1 = createNewSphere(SPHERE1_POS, 20, 0xEB9109)
const sphere2 = createNewSphere(SPHERE2_POS, 20, 0xEB9109)
const sphere3 = createNewSphere(SPHERE3_POS, 20, 0xEB9109)
const sphere4 = createNewSphere(SPHERE4_POS, 20, 0xEB9109)

const view1 = createNewSphere(VIEW1_POS, 10, 0xD0F9D6)
const view2 = createNewSphere(VIEW2_POS, 10, 0xCED0FF)
const view3 = createNewSphere(VIEW3_POS, 10, 0xFFB9B9)

const rays = [
    createNewLine(VIEW1_POS, SPHERE1_POS, 0xD0F9D6),
    // The following two are the same ray above...
    // because these spheres are collinear w.r.t view1
    // createNewLine(VIEW1_POS, SPHERE2_POS, 0xD0F9D6),
    // createNewLine(VIEW1_POS, SPHERE3_POS, 0xD0F9D6),
    createNewLine(VIEW1_POS, SPHERE4_POS, 0xD0F9D6),
    createNewLine(VIEW2_POS, SPHERE1_POS, 0xCED0FF),
    createNewLine(VIEW2_POS, SPHERE2_POS, 0xCED0FF),
    createNewLine(VIEW2_POS, SPHERE3_POS, 0xCED0FF),
    createNewLine(VIEW2_POS, SPHERE4_POS, 0xCED0FF),
    createNewLine(VIEW3_POS, SPHERE1_POS, 0xFFB9B9),
    createNewLine(VIEW3_POS, SPHERE2_POS, 0xFFB9B9),
    createNewLine(VIEW3_POS, SPHERE3_POS, 0xFFB9B9),
    createNewLine(VIEW3_POS, SPHERE4_POS, 0xFFB9B9),
]

const viewPlane1 = createNewPlane(VIEW1_POS, VIEW1_TARGET, 0xD0F9D6)
const viewPlane2 = createNewPlane(VIEW2_POS, VIEW2_TARGET, 0xCED0FF)
const viewPlane3 = createNewPlane(VIEW3_POS, VIEW3_TARGET, 0xFFB9B9)

const scene = new THREE.Scene()
scene.add(

    // Scene setup
    ambLight, dirLight, axesHelper, ground,

    // Points being observed
    sphere1, sphere2, sphere3, sphere4,

    // Optical centers of "cameras" views observing the points
    view1, view2, view3,

    // The viewing/projection planes of each optical center
    viewPlane1, viewPlane2, viewPlane3,

    // Epipolar planes connecting each two "cameras"
    epipolarPlane12, epipolarPlane13, epipolarPlane23,

    // Rays connecting optical centers with points (for better visualization of point projection)
    ...rays,

).fog = new THREE.Fog(0x191919, 1000, 5000)

const controls = new MapControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.1
controls.maxDistance = 1500
controls.enablePan = false
controls.enableRotate = false
controls.enableZoom = false

const viewControls = {
    freeroam: false,
    cameraTilt: 0.0,
    view3Tilt: 0.0,
    animSpeed: 1.0,
    e12visible: false,
    e13visible: false,
    e23visible: false,
    c: () => {
        console.log(
            "Rotation: " + controls.object.rotation.toArray()
            + "\nPosition: " + controls.object.position.toArray()
            + "\nTarget: " + controls.target.toArray()
            + "\nUp: " + controls.object.up.toArray()
        )
    },
    v1: () => {
        cameraPos = VIEW1_POS
        cameraTarget = VIEW1_TARGET
        setFreeroam(viewControls.freeroam = false)
    },
    v2: () => {
        cameraPos = VIEW2_POS
        cameraTarget = VIEW2_TARGET
        setFreeroam(viewControls.freeroam = false)
    },
    v3: () => {
        cameraPos = VIEW3_POS
        cameraTarget = VIEW3_TARGET
        setFreeroam(viewControls.freeroam = false)
    },
    r: () => {
        cameraPos = START_POS
        cameraTarget = START_TARGET
        viewControls.cameraTilt = 0.0
        setFreeroam(viewControls.freeroam = false)
    },
}

const gui = new dat.GUI({ width: 300 })
gui.add(viewControls, 'c').name('console.log -- for debugging purposes')
gui.add(viewControls, 'v1').name('Switch to view 1')
gui.add(viewControls, 'v2').name('Switch to view 2')
gui.add(viewControls, 'v3').name('Switch to view 3')
gui.add(viewControls, 'r').name('Reset view')
gui.add(viewControls, 'view3Tilt', -30, 30, 5).name("Tilt view 3").listen().domElement.classList += " special_red"
gui.add(viewControls, 'cameraTilt', -60, 60, 1).name("Camera tilt").listen().domElement.classList += " full_width_slider"
gui.add(viewControls, 'animSpeed', 0.5, 2.5, 0.1).name("Animation speed").domElement.classList += " full_width_slider"
gui.add(viewControls, 'e12visible').name('Toggle epipolar plane O1-P-O2').onChange(e => epipolarPlane12.visible = e)
gui.add(viewControls, 'e13visible').name('Toggle epipolar plane O1-P-O3').onChange(e => epipolarPlane13.visible = e)
gui.add(viewControls, 'e23visible').name('Toggle epipolar plane O2-P-O3').onChange(e => epipolarPlane23.visible = e)
gui.add(viewControls, 'freeroam').name('Toggle freeroam').onChange(setFreeroam).listen()

animate()

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
}

function setFreeroam(enabled) {
    controls.enablePan = controls.enableRotate = controls.enableZoom = enabled
}

function calculatePlanePosition(viewPos, viewTarget, focalLength = 180) {
    // 1. Get vector from view position to view target
    let posToTarget = new THREE.Vector3().subVectors(viewTarget, viewPos)
    // 2. Normalize it
    posToTarget.normalize()
    // 3. Multiply it by desired focal length
    posToTarget.multiplyScalar(focalLength)
    // 4. Add that to the view pos
    return new THREE.Vector3().addVectors(viewPos, posToTarget)
}

function createNewSphere(o, radius, color) {
    let sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 64, 64),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.2, metalness: 0.99 })
    )
    sphere.position.set(...o)
    return sphere
}

function createNewEpipolarPlane(o1, o2, p) {
    let epipolarPlane = new THREE.Mesh(
        new THREE.BufferGeometry().setFromPoints([o1, o2, p]),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.1, side: THREE.DoubleSide })
    )
    epipolarPlane.renderOrder = 2
    return epipolarPlane
}

function createNewPlane(viewPos, viewTarget, color) {
    let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(180, 120),
        new THREE.MeshBasicMaterial({ color: color, depthWrite: false, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
    )
    plane.position.set(...calculatePlanePosition(viewPos, viewTarget))
    plane.lookAt(viewTarget)
    plane.renderOrder = 1
    return plane
}

function createNewLine(p1, p2, color) {
    return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([p1, p2]),
        new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending })
    )
}

function animate(time) {
    requestAnimationFrame(animate)
    controls.update()
    if (!viewControls.freeroam) {
        controls.object.position.lerp(cameraPos, 0.04 * viewControls.animSpeed)
        controls.target.lerp(cameraTarget, 0.04 * viewControls.animSpeed)
    }
    // Did I just rediscover quaternions?
    controls.object.up =
        new THREE.Vector3(0, 1, 0)
            .applyAxisAngle(
                new THREE.Vector3(0, 0, 1),
                -THREE.MathUtils.degToRad(viewControls.cameraTilt)
            )

    viewPlane3.rotation.z = THREE.MathUtils.degToRad(viewControls.view3Tilt)
    renderer.render(scene, camera)
}
