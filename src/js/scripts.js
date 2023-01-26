import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "cannon-es";
import * as dat from "dat.gui";

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(20, 20, 20);
orbit.update();

const directionLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionLight);
directionLight.position.set(40, 50, 10);

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.81, 0) });

const mouse = new THREE.Vector2();
const intersectionPoint = new THREE.Vector3();
const plainNormal = new THREE.Vector3();
const plane = new THREE.Plane();
const raycaster = new THREE.Raycaster();

window.addEventListener("mousemove", function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    plainNormal.copy(camera.position).normalize();
    plane.setFromNormalAndCoplanarPoint(plainNormal, scene.position);
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, intersectionPoint);
});
let meshes = [];
let bodies = [];

window.addEventListener("click", function (e) {
    const sphereGeo = new THREE.SphereGeometry(0.5, 30, 30);
    const sphereMat = new THREE.MeshStandardMaterial({
        color: 0xffea00,
        metalness: 0,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    meshes.push(sphereMesh);
    scene.add(sphereMesh);
    sphereMesh.position.copy(intersectionPoint);

    const spherePhysMat = new CANNON.Material();
    const sphereBody = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Sphere(0.4), // такой же радиус у шара в tree.js
        position: new CANNON.Vec3(
            intersectionPoint.x,
            intersectionPoint.y,
            intersectionPoint.z
        ),
    });
    bodies.push(sphereBody);
    world.addBody(sphereBody);

    const groundSphereContactMat = new CANNON.ContactMaterial(spherePhysMat, {
        restitution: 0.9,
    });
    world.addContactMaterial(groundSphereContactMat);
});

/* поверхность 1 */
const planeGeo = new THREE.PlaneGeometry(10, 10);
const planeMat = new THREE.MeshBasicMaterial({
    color: 0x1287f5,
    side: THREE.DoubleSide,
});
const planeMesh = new THREE.Mesh(planeGeo, planeMat);
scene.add(planeMesh);

const groundPhysMat = new CANNON.Material();
const groundBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(5, 5, 0.1)), // половина размера куба в tree.js
    // mass: 10,
    type: CANNON.Body.STATIC,
    material: groundPhysMat,
    position: new CANNON.Vec3(-5, 2, 0),
});
world.addBody(groundBody);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0.2, 0);
/* --поверхность 1-- */

/* поверхность 2 */
const planeGeo2 = new THREE.PlaneGeometry(10, 10);
const planeMat2 = new THREE.MeshBasicMaterial({
    color: 0x9287f5,
    side: THREE.DoubleSide,
});
const planeMesh2 = new THREE.Mesh(planeGeo2, planeMat2);
scene.add(planeMesh2);

const groundPhysMat2 = new CANNON.Material();
const groundBody2 = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(5, 5, 0.1)),
    type: CANNON.Body.STATIC,
    material: groundPhysMat2,
    position: new CANNON.Vec3(5, -2, 0),
});
world.addBody(groundBody2);
groundBody2.quaternion.setFromEuler(-Math.PI / 2, -0.2, 0);
/* --поверхность 2-- */

/* поверхность 3 */
const planeGeo3 = new THREE.PlaneGeometry(10, 10);
const planeMat3 = new THREE.MeshBasicMaterial({
    color: 0x4217f5,
    side: THREE.DoubleSide,
});
const planeMesh3 = new THREE.Mesh(planeGeo3, planeMat3);
scene.add(planeMesh3);

const groundPhysMat3 = new CANNON.Material();
const groundBody3 = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(5, 5, 0.1)),
    type: CANNON.Body.STATIC,
    material: groundPhysMat3,
    position: new CANNON.Vec3(-5, -4, 0),
});
world.addBody(groundBody3);
groundBody3.quaternion.setFromEuler(-Math.PI / 2, 0.2, 0);
/* --поверхность 3-- */

/* графический интерфейс  */
const gui = new dat.GUI();

const options = {
    plane1Color: "#1287f5",
    plane2Color: "#9287f5",
    plane3Color: "#4217f5",
    wireframe: false,
    wireframe2: false,
    wireframe3: false,
};

// создание рычагов управления
gui.addColor(options, "plane1Color").onChange(function (e) {
    planeMesh.material.color.set(e);
});
gui.add(options, "wireframe").onChange(function (e) {
    planeMesh.material.wireframe = e;
});

gui.addColor(options, "plane2Color").onChange(function (e) {
    planeMesh2.material.color.set(e);
});
gui.add(options, "wireframe2").onChange(function (e) {
    planeMesh2.material.wireframe = e;
});

gui.addColor(options, "plane3Color").onChange(function (e) {
    planeMesh3.material.color.set(e);
});
gui.add(options, "wireframe3").onChange(function (e) {
    planeMesh3.material.wireframe = e;
});
/* --графический интерфейс -- */

const timeSleep = 1 / 60;
function animate() {
    world.step(timeSleep);

    planeMesh.position.copy(groundBody.position);
    planeMesh.quaternion.copy(groundBody.quaternion);

    planeMesh2.position.copy(groundBody2.position);
    planeMesh2.quaternion.copy(groundBody2.quaternion);

    planeMesh3.position.copy(groundBody3.position);
    planeMesh3.quaternion.copy(groundBody3.quaternion);

    for (let i = 0; i !== meshes.length; i++) {
        meshes[i].position.copy(bodies[i].position);
        meshes[i].quaternion.copy(bodies[i].quaternion);
    }

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
