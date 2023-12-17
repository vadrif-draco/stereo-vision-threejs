import * as THREE from 'three';
import * as dat from 'dat.gui';
import { MapControls } from 'three/examples/jsm/controls/MapControls'

const START_POS = [200, 800, 1500]
const START_TARGET = [250, 0, 350]

const CAM1_POS = [40, 100, 850]
const CAM1_TARGET = [360, 100, 420]

const CAM2_POS = [180, 100, 960]
const CAM2_TARGET = [500, 100, 530]

let pos = START_POS
let target = START_TARGET
let camFreeRoam = { enabled: false }
let animationMultiplier = { value: 1.0 }

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 20, 20000);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
window.addEventListener('resize', onWindowResize, false);

const controls = new MapControls(camera, renderer.domElement);
controls.enableDamping = true
controls.enablePan = false
controls.enableRotate = false
controls.enableZoom = false

const gui = new dat.GUI({ width: 300 });
const camSwitcher = {
    c: () => {
        console.log("Target: ")
        console.log(controls.target)
        console.log("Position: ")
        console.log(controls.object.position)
        console.log("Rotation: ")
        console.log(controls.object.rotation)
    },
    v1: () => {
        pos = CAM1_POS;
        target = CAM1_TARGET;
        camFreeRoam.enabled = false;
    },
    v2: () => {
        pos = CAM2_POS;
        target = CAM2_TARGET;
        camFreeRoam.enabled = false;
    },
    v3: () => {
        camFreeRoam.enabled = false;
        // Tilt me pls
    },
    r: () => {
        pos = START_POS;
        target = START_TARGET;
        camFreeRoam.enabled = false;
    },
};
gui.add(camSwitcher, 'c').name('console.log -- for debugging purposes');
gui.add(camSwitcher, 'v1').name('Switch to view 1');
gui.add(camSwitcher, 'v2').name('Switch to view 2');
gui.add(camSwitcher, 'v3').name('Switch to view 3');
gui.add(camSwitcher, 'r').name('Reset view');
gui.add(animationMultiplier, 'value', 0.2, 2.0, 0.1).name("Animation speed");
gui.add(camFreeRoam, 'enabled').name('Toggle freeroam').onChange(setFreeroam).listen();

const scene = new THREE.Scene();

const ambientlight = new THREE.AmbientLight(0xffffff, 10);
scene.add(ambientlight);

const pointlight = new THREE.DirectionalLight(0xffffff, 50, 0, 0.5);
pointlight.position.set(100, 10000, 100);
scene.add(pointlight);

const axesHelper = new THREE.AxesHelper(10000);
scene.add(axesHelper);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(3000, 3000),
    new THREE.MeshBasicMaterial({ color: 0x333333, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
);
ground.rotation.x = -0.5 * Math.PI;
ground.position.x = 1500;
ground.position.z = 1500;
scene.add(ground)

const camera1plane = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 100),
    new THREE.MeshBasicMaterial({ color: 0xD0F9D6, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
)
camera1plane.rotateY(-0.64)
camera1plane.position.y = 100;
camera1plane.position.x = 140;
camera1plane.position.z = 700;
scene.add(camera1plane)

const camera2plane = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 100),
    new THREE.MeshBasicMaterial({ color: 0xCED0FF, transparent: true, opacity: 0.2, side: THREE.DoubleSide })
)
camera2plane.rotateY(-0.64)
camera2plane.position.y = 100;
camera2plane.position.x = 290;
camera2plane.position.z = 815;
scene.add(camera2plane)

createNewSphere(...CAM1_POS, 0xD0F9D6, 10);
createNewSphere(...CAM2_POS, 0xCED0FF, 10);
createNewSphere(600, 100, 300, 0xEB9109, 20);
createNewSphere(550, 100, 350, 0xEB9109, 20);
createNewSphere(500, 100, 400, 0xEB9109, 20);
createNewSphere(380, 20, 280, 0xEB9109, 20);
animate();

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function setFreeroam(enabled) {
    controls.enablePan = controls.enableRotate = controls.enableZoom = enabled
}

function createNewSphere(x, y, z, color, radius) {
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 64, 64),
        new THREE.MeshStandardMaterial({ color: color, roughness: 0.2, metalness: 0.98 })
    );
    sphere.position.set(x, y, z);
    scene.add(sphere);
    return sphere
}

function animate(time) {
    if (!camFreeRoam.enabled) {
        controls.target.lerp(new THREE.Vector3(...target), 0.04 * animationMultiplier.value)
        controls.object.position.lerp(new THREE.Vector3(...pos), 0.04 * animationMultiplier.value)
    }
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}