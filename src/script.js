import * as dat from 'dat.gui'
import * as THREE from 'three'
import { MapControls } from 'three/examples/jsm/controls/MapControls'

// TODO: Actually make everything dynamic, everything with arrays and loops.. no counting 1 2 3 4 please!

const START_POS = new THREE.Vector3(450, 800, 1250)
const START_TARGET = new THREE.Vector3(450, 50, 350)

let cameraPos = START_POS
let cameraTarget = START_TARGET

const VIEW1_POS = new THREE.Vector3(40, 200, 850)
const VIEW1_TARGET = new THREE.Vector3(360, 200, 420)

const VIEW2_POS = new THREE.Vector3(240, 200, 1000)
const VIEW2_TARGET = new THREE.Vector3(550, 200, 570)

const VIEW3_POS = new THREE.Vector3(930, 200, 850)
const VIEW3_TARGET = new THREE.Vector3(630, 200, 450)

const SPHERE2_DEPTH_OFFSET = 100
const SPHERE3_DEPTH_OFFSET = 200

const SPHERE1_START_POS = new THREE.Vector3(600, 200, 300)
const SPHERE2_START_POS = calculateSpherePositionAtDepth(VIEW1_POS, SPHERE1_START_POS, SPHERE2_DEPTH_OFFSET)
const SPHERE3_START_POS = calculateSpherePositionAtDepth(VIEW1_POS, SPHERE1_START_POS, SPHERE3_DEPTH_OFFSET)
const SPHERE4_START_POS = new THREE.Vector3(380, 120, 280)

const LORANGE = 0xEB9109 // Light Orange
const LGREEN = 0xD0F9D6 // Light Green
const LBLUE = 0xCED0FF // Light Blue
const LRED = 0xFFB9B9 // Light Red
const WHITE = 0xFFFFFF

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

const sphere1 = createNewSphere(SPHERE1_START_POS, 20, LORANGE)
const sphere2 = createNewSphere(SPHERE2_START_POS, 20, LORANGE)
const sphere3 = createNewSphere(SPHERE3_START_POS, 20, LORANGE)
const sphere4 = createNewSphere(SPHERE4_START_POS, 20, LORANGE)

const view1 = createNewSphere(VIEW1_POS, 10, LGREEN)
const view2 = createNewSphere(VIEW2_POS, 10, LBLUE)
const view3 = createNewSphere(VIEW3_POS, 10, LRED)

const viewPlane1 = createNewPlane(VIEW1_POS, VIEW1_TARGET, LGREEN)
const viewPlane2 = createNewPlane(VIEW2_POS, VIEW2_TARGET, LBLUE)
const viewPlane3 = createNewPlane(VIEW3_POS, VIEW3_TARGET, LRED)
const allTheViewPlanes = [viewPlane1, viewPlane2, viewPlane3]

const view1Rays = [
    createNewLine(VIEW1_POS, SPHERE1_START_POS, LGREEN),
    createNewLine(VIEW1_POS, SPHERE2_START_POS, LGREEN),
    createNewLine(VIEW1_POS, SPHERE3_START_POS, LGREEN),
    createNewLine(VIEW1_POS, SPHERE4_START_POS, LGREEN),
]
// They're coincident with view1Rays[2], so I'm setting them invisible to avoid render artifacts
view1Rays[0].visible = view1Rays[1].visible = false
const view2Rays = [
    createNewLine(VIEW2_POS, SPHERE1_START_POS, LBLUE),
    createNewLine(VIEW2_POS, SPHERE2_START_POS, LBLUE),
    createNewLine(VIEW2_POS, SPHERE3_START_POS, LBLUE),
    createNewLine(VIEW2_POS, SPHERE4_START_POS, LBLUE),
]
const view3Rays = [
    createNewLine(VIEW3_POS, SPHERE1_START_POS, LRED),
    createNewLine(VIEW3_POS, SPHERE2_START_POS, LRED),
    createNewLine(VIEW3_POS, SPHERE3_START_POS, LRED),
    createNewLine(VIEW3_POS, SPHERE4_START_POS, LRED),
]
const allTheRays = [view1Rays, view2Rays, view3Rays]

const epipolarPlane12 = createNewEpipolarPlane(VIEW1_POS, VIEW2_POS, SPHERE3_START_POS, WHITE, 0.2)
const epipolarPlane23 = createNewEpipolarPlane(VIEW2_POS, VIEW3_POS, SPHERE3_START_POS, WHITE, 0.2)
const epipolarPlane13 = createNewEpipolarPlane(VIEW1_POS, VIEW3_POS, SPHERE3_START_POS, WHITE, 0.2)
epipolarPlane12.visible = false // initially invisible, then gets toggled by user
epipolarPlane23.visible = false // initially invisible, then gets toggled by user
epipolarPlane13.visible = false // initially invisible, then gets toggled by user

const epipolarLines12 = [
    createNewLine(...findEpipolarLineEndpoints(viewPlane1, epipolarPlane12, view1Rays[2]), WHITE, 0.5),
    createNewLine(...findEpipolarLineEndpoints(viewPlane2, epipolarPlane12, view2Rays[2]), WHITE, 0.5),
    createNewLine(...findEpipolarLineEndpoints(viewPlane3, epipolarPlane12, view3Rays[2]), WHITE, 0.5),
]
epipolarLines12.forEach(line => line.visible = false) // initially invisible, then gets toggled by user

const epipolarLines23 = [
    createNewLine(...findEpipolarLineEndpoints(viewPlane1, epipolarPlane23, view1Rays[2]), WHITE, 0.5),
    createNewLine(...findEpipolarLineEndpoints(viewPlane2, epipolarPlane23, view2Rays[2]), WHITE, 0.5),
    createNewLine(...findEpipolarLineEndpoints(viewPlane3, epipolarPlane23, view3Rays[2]), WHITE, 0.5),
]
epipolarLines23.forEach(line => line.visible = false) // initially invisible, then gets toggled by user

const epipolarLines13 = [
    createNewLine(...findEpipolarLineEndpoints(viewPlane1, epipolarPlane13, view1Rays[2]), WHITE, 0.5),
    createNewLine(...findEpipolarLineEndpoints(viewPlane2, epipolarPlane13, view2Rays[2]), WHITE, 0.5),
    createNewLine(...findEpipolarLineEndpoints(viewPlane3, epipolarPlane13, view3Rays[2]), WHITE, 0.5),
]
epipolarLines13.forEach(line => line.visible = false) // initially invisible, then gets toggled by user

const scene = new THREE.Scene()
scene.add(

    // Scene setup
    ambLight, dirLight, axesHelper, ground,

    // Points being observed
    sphere1, sphere2, sphere3, sphere4,

    // Optical centers of "cameras" views observing the points
    view1, view2, view3,

    // Rays connecting optical centers with points (for better visualization of point projection)
    ...view1Rays, ...view2Rays, ...view3Rays,

    // The viewing/projection planes of each optical center
    viewPlane1, viewPlane2, viewPlane3,

    // Epipolar planes connecting each two "cameras"
    epipolarPlane12, epipolarPlane23, epipolarPlane13,

    // Epipolar lines (intersections with each view) for each epipolar plane
    ...epipolarLines12, ...epipolarLines23, ...epipolarLines13,

).fog = new THREE.Fog(0x191919, 1000, 5000)

const controls = new MapControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.1
controls.maxDistance = 1500
controls.enablePan = false
controls.enableRotate = false
controls.enableZoom = false

const viewControls = {
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
    view3Tilt: 0.0,
    cameraTilt: 0.0,
    animSpeed: 1.0,
    sphereHeightOffset: 0,
    rct: () => {
        viewControls.cameraTilt = 0.0
    },
    rcp: () => {
        cameraPos = START_POS
        cameraTarget = START_TARGET
        setFreeroam(viewControls.freeroam = false)
    },
    e12visible: false,
    e13visible: false,
    e23visible: false,
    freeroam: false,
}

const gui = new dat.GUI({ width: 300 })

gui.add(viewControls, 'c').name('console.log -- for debugging purposes; ignore')
    .domElement.classList += " special_black"

gui.add(viewControls, 'sphereHeightOffset', -100, 350, 5).name('Offset spheres').onChange(
    e => {
        updateSpheres()
        updateRays()
        updateEpipolarPlanes()
        updateEpipolarLines()
    }
)
    .domElement.classList += " special_orange"

gui.add(viewControls, 'v1').name('Switch to view 1')

gui.add(viewControls, 'v2').name('Switch to view 2')

gui.add(viewControls, 'v3').name('Switch to view 3')

gui.add(viewControls, 'view3Tilt', -30, 30, 5).name("Tilt view 3").listen().onChange(
    e => {
        updateView3Rotation()
        updateEpipolarLines()
    }
).domElement.classList += " special_red"

gui.add(viewControls, 'cameraTilt', -60, 60, 1).name("Camera tilt").listen()
    .domElement.classList += " full_width_slider"

gui.add(viewControls, 'animSpeed', 0.5, 2.5, 0.1).name("Animation speed")
    .domElement.classList += " full_width_slider"

gui.add(viewControls, 'rct').name('Reset camera tilt')
    .domElement.classList += " special_blue"

gui.add(viewControls, 'rcp').name('Reset camera position')
    .domElement.classList += " special_blue"

gui.add(viewControls, 'e12visible').name('Toggle epipolar plane O1-P-O2').onChange(
    e => {
        epipolarPlane12.visible = e
        epipolarLines12.forEach(line => line.visible = e)
    }
).domElement.classList += " special_gray"

gui.add(viewControls, 'e23visible').name('Toggle epipolar plane O2-P-O3').onChange(
    e => {
        epipolarPlane23.visible = e
        epipolarLines23.forEach(line => line.visible = e)
    }
).domElement.classList += " special_gray"

gui.add(viewControls, 'e13visible').name('Toggle epipolar plane O1-P-O3').onChange(
    e => {
        epipolarPlane13.visible = e
        epipolarLines13.forEach(line => line.visible = e)
    }
).domElement.classList += " special_gray"

gui.add(viewControls, 'freeroam').name('Toggle freeroam').onChange(setFreeroam).listen()

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

function calculateSpherePositionAtDepth(viewPos, spherePos, depthOffset) {
    // 1. Get vector from view position to view target
    let viewToSphere = new THREE.Vector3().subVectors(spherePos, viewPos)
    // 2. Get its current length
    let len = viewToSphere.length()
    // 3. Normalize it
    viewToSphere.normalize()
    // 4. Multiply it back to its length + the depth offset from it
    viewToSphere.multiplyScalar(len + depthOffset)
    // 5. Add it back to the view position
    return new THREE.Vector3().addVectors(viewPos, viewToSphere)
}

function createNewSphere(pos, radius, color) {
    let sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 64, 64),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.2, metalness: 0.99 })
    )
    sphere.position.set(...pos)
    return sphere
}

function createNewEpipolarPlane(o1, o2, p, color, opacity) {
    let epipolarPlane = new THREE.Mesh(
        new THREE.BufferGeometry().setFromPoints([o1, o2, p]),
        new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity, side: THREE.DoubleSide })
    )
    epipolarPlane.renderOrder = 2
    return epipolarPlane
}

function findEpipolarLineEndpoints(imageViewMesh, epipolarPlaneMesh, rayMesh) {

    // Get the image view rectangle's points
    let imageViewP1 = new THREE.Vector3(...imageViewMesh.geometry.attributes.position.array.slice(0, 3))
    let imageViewP2 = new THREE.Vector3(...imageViewMesh.geometry.attributes.position.array.slice(3, 6))
    let imageViewP3 = new THREE.Vector3(...imageViewMesh.geometry.attributes.position.array.slice(6, 9))
    let imageViewP4 = new THREE.Vector3(...imageViewMesh.geometry.attributes.position.array.slice(9, 12))
    // These points are in local coordinates and thus need to be transformed to world coordinates
    imageViewMesh.localToWorld(imageViewP1)
    imageViewMesh.localToWorld(imageViewP2)
    imageViewMesh.localToWorld(imageViewP3)
    imageViewMesh.localToWorld(imageViewP4)
    // Get the boundary lines using these points
    let imageViewPlaneLine31 = new THREE.Line3(imageViewP3, imageViewP1) // Vertical
    let imageViewPlaneLine42 = new THREE.Line3(imageViewP4, imageViewP2) // Vertical
    let imageViewPlaneLine12 = new THREE.Line3(imageViewP1, imageViewP2) // Horizontal
    let imageViewPlaneLine34 = new THREE.Line3(imageViewP3, imageViewP4) // Horizontal
    // Get the image view plane using three of these points
    let imageViewPlane = new THREE.Plane().setFromCoplanarPoints(imageViewP1, imageViewP2, imageViewP3)

    // Get the epipolar plane's points
    let epipolarPlaneP1 = new THREE.Vector3(...epipolarPlaneMesh.geometry.attributes.position.array.slice(0, 3))
    let epipolarPlaneP2 = new THREE.Vector3(...epipolarPlaneMesh.geometry.attributes.position.array.slice(3, 6))
    let epipolarPlaneP3 = new THREE.Vector3(...epipolarPlaneMesh.geometry.attributes.position.array.slice(6, 9))
    // Convert to world coordinates
    epipolarPlaneMesh.localToWorld(epipolarPlaneP1)
    epipolarPlaneMesh.localToWorld(epipolarPlaneP2)
    epipolarPlaneMesh.localToWorld(epipolarPlaneP3)
    // Get the epipoler plane
    let epipolarPlane = new THREE.Plane().setFromCoplanarPoints(epipolarPlaneP1, epipolarPlaneP2, epipolarPlaneP3)

    // Get the start and end points of the projection of the point onto view
    let rayP1 = new THREE.Vector3(...rayMesh.geometry.attributes.position.array.slice(0, 3))
    let rayP2 = new THREE.Vector3(...rayMesh.geometry.attributes.position.array.slice(3, 6))
    // Convert to world coordinates
    rayMesh.localToWorld(rayP1)
    rayMesh.localToWorld(rayP2)
    // Get the line
    let rayLine = new THREE.Line3(rayP1, rayP2)

    // Create a box (rectangle) surrounding the image view mesh
    let imageViewBox = new THREE.Box3().setFromObject(imageViewMesh)

    // Get intersection points between the image view boundary lines with the epipolar plane
    let left = new THREE.Vector3(), right = new THREE.Vector3()
    epipolarPlane.intersectLine(imageViewPlaneLine42, left)
    if (!imageViewBox.containsPoint(left)) epipolarPlane.intersectLine(imageViewPlaneLine12, left)
    if (!imageViewBox.containsPoint(left)) epipolarPlane.intersectLine(imageViewPlaneLine34, left)
    if (!imageViewBox.containsPoint(left)) epipolarPlane.intersectLine(imageViewPlaneLine31, left)
    epipolarPlane.intersectLine(imageViewPlaneLine31, right)
    if (!imageViewBox.containsPoint(right)) epipolarPlane.intersectLine(imageViewPlaneLine34, right)
    if (!imageViewBox.containsPoint(right)) epipolarPlane.intersectLine(imageViewPlaneLine12, right)
    if (!imageViewBox.containsPoint(right)) epipolarPlane.intersectLine(imageViewPlaneLine42, right)

    // Get intersection point between point projection ray on plane with the image view plane
    let mid = new THREE.Vector3()
    imageViewPlane.intersectLine(rayLine, mid)

    // Create a triangle to represent the epipolar plane
    let epipolarPlaneTriangle = new THREE.Triangle(epipolarPlaneP1, epipolarPlaneP2, epipolarPlaneP3)
    
    // Find the closest point within the triangle to the ray-view intersection point
    // If they're the same point, then this intersection point lies on the epipolar plane!
    // Of course, some error should be tolerated, so I won't check for exact equality
    let closestPointToMid = new THREE.Vector3()
    epipolarPlaneTriangle.closestPointToPoint(mid, closestPointToMid)
    let d = mid.distanceTo(closestPointToMid)

    // Depending on which of the two points (left/right) is on the epipolar plane, return appropriate start-end points
    if (epipolarPlaneTriangle.containsPoint(left) && epipolarPlaneTriangle.containsPoint(right)) return [left, right]
    else if (epipolarPlaneTriangle.containsPoint(left) && d < 1) return [left, mid]
    else if (epipolarPlaneTriangle.containsPoint(right) && d < 1) return [right, mid]
    else return [new THREE.Vector3(), new THREE.Vector3()]

}

function createNewPlane(viewPos, viewTarget, color) {
    let plane = new THREE.Mesh(
        new THREE.PlaneGeometry(180, 180),
        new THREE.MeshBasicMaterial({ color: color, depthWrite: false, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
    )
    plane.position.set(...calculatePlanePosition(viewPos, viewTarget))
    plane.lookAt(viewTarget)
    plane.renderOrder = 1
    return plane
}

function createNewLine(p1, p2, color, opacity = 0.1) {
    return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([p1, p2]),
        new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity, blending: THREE.AdditiveBlending })
    )
}

function updateView3Rotation() {
    viewPlane3.rotation.z = THREE.MathUtils.degToRad(viewControls.view3Tilt)
}

function updateSpheres() {
    sphere1.position.y = SPHERE1_START_POS.y + viewControls.sphereHeightOffset
    sphere2.position.set(...calculateSpherePositionAtDepth(VIEW1_POS, sphere1.position, SPHERE2_DEPTH_OFFSET))
    sphere3.position.set(...calculateSpherePositionAtDepth(VIEW1_POS, sphere1.position, SPHERE3_DEPTH_OFFSET))
    sphere4.position.y = SPHERE4_START_POS.y + viewControls.sphereHeightOffset
}

function updateRays() {
    allTheRays.forEach((viewRays) => {
        viewRays[0].geometry.attributes.position.array[4] = sphere1.position.y
        viewRays[1].geometry.attributes.position.array[4] = sphere2.position.y
        viewRays[2].geometry.attributes.position.array[4] = sphere3.position.y
        viewRays[3].geometry.attributes.position.array[4] = sphere4.position.y
        viewRays.forEach(ray => ray.geometry.attributes.position.needsUpdate = true)
    })
}

function updateEpipolarPlanes() {
    epipolarPlane12.geometry.attributes.position.array[7] = sphere3.position.y
    epipolarPlane23.geometry.attributes.position.array[7] = sphere3.position.y
    epipolarPlane13.geometry.attributes.position.array[7] = sphere3.position.y
    epipolarPlane12.geometry.attributes.position.needsUpdate = true
    epipolarPlane23.geometry.attributes.position.needsUpdate = true
    epipolarPlane13.geometry.attributes.position.needsUpdate = true
}

function updateEpipolarLines() {
    epipolarLines12.forEach((epipolarLine, i) => {
        let endpoints = findEpipolarLineEndpoints(allTheViewPlanes[i], epipolarPlane12, allTheRays[i][2])
        let endpointsCoords = [...endpoints[0], ...endpoints[1]]
        endpointsCoords.forEach((coord, j) => epipolarLine.geometry.attributes.position.array[j] = coord)
        epipolarLine.geometry.attributes.position.needsUpdate = true
    })
    epipolarLines23.forEach((epipolarLine, i) => {
        let endpoints = findEpipolarLineEndpoints(allTheViewPlanes[i], epipolarPlane23, allTheRays[i][2])
        let endpointsCoords = [...endpoints[0], ...endpoints[1]]
        endpointsCoords.forEach((coord, j) => epipolarLine.geometry.attributes.position.array[j] = coord)
        epipolarLine.geometry.attributes.position.needsUpdate = true
    })
    epipolarLines13.forEach((epipolarLine, i) => {
        let endpoints = findEpipolarLineEndpoints(allTheViewPlanes[i], epipolarPlane13, allTheRays[i][2])
        let endpointsCoords = [...endpoints[0], ...endpoints[1]]
        endpointsCoords.forEach((coord, j) => epipolarLine.geometry.attributes.position.array[j] = coord)
        epipolarLine.geometry.attributes.position.needsUpdate = true
    })
}

function animate(time) {
    requestAnimationFrame(animate)
    controls.update()
    if (!viewControls.freeroam) {
        controls.object.position.lerp(cameraPos, 0.04 * viewControls.animSpeed)
        controls.target.lerp(cameraTarget, 0.04 * viewControls.animSpeed)
    }
    // Did I just rediscover quaternions?
    controls.object.up.lerp(
        new THREE.Vector3(0, 1, 0)
            .applyAxisAngle(
                new THREE.Vector3(0, 0, 1),
                -THREE.MathUtils.degToRad(viewControls.cameraTilt)
            ),
        0.1
    )
    renderer.render(scene, camera)
}

animate()
