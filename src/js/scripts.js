import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as CANNON from "cannon-es";

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

camera.position.set(0, 20, -30);
orbit.update();

const boxGeo = new THREE.BoxGeometry(2, 2, 2);
const boxMat = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
});
const boxMesh = new THREE.Mesh(boxGeo, boxMat);
scene.add(boxMesh);

const sphereGeo = new THREE.SphereGeometry(2);
const sphereMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    wireframe: true,
});
const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(sphereMesh);

const groupGeo = new THREE.PlaneGeometry(30, 30);
const groupMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    wireframe: true,
});
const groupMash = new THREE.Mesh(groupGeo, groupMat);
scene.add(groupMash);

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.81, 0) });

const groundPhysMat = new CANNON.Material();

const groundBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(15, 15, 0.1)), // половина размера куба в tree.js
    // mass: 10,
    type: CANNON.Body.STATIC,
    material: groundPhysMat,
});
world.addBody(groundBody);
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

const boxPhysMat = new CANNON.Material();

const boxBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Box(new CANNON.Vec3(1, 1, 1)), // половина размера куба в tree.js
    position: new CANNON.Vec3(0, 20, 0),
    material: boxPhysMat,
});
world.addBody(boxBody);

boxBody.angularVelocity.set(1, 10, 1);
boxBody.angularDamping = 0.5;

const groupBoxContactMat = new CANNON.ContactMaterial(
    groundPhysMat,
    boxPhysMat,
    { friction: 0.1 }
);
world.addContactMaterial(groupBoxContactMat);

const spherePhysMat = new CANNON.Material();

const sphereBody = new CANNON.Body({
    mass: 5,
    shape: new CANNON.Sphere(2), // такой же радиус у шара в tree.js
    position: new CANNON.Vec3(0, 15, 0),
    material: spherePhysMat,
});
world.addBody(sphereBody);

// сопротивление воздуха вымеряно точно,
// что бы куб почти упал, но все таки удержался
sphereBody.linearDamping = 0.31;

const groundSphereContactMat = new CANNON.ContactMaterial(
    spherePhysMat,
    groundPhysMat,
    { restitution: 0.9 }
);

world.addContactMaterial(groundSphereContactMat);

const timeSleep = 1 / 60;

function animate() {
    world.step(timeSleep);

    groupMash.position.copy(groundBody.position);
    groupMash.quaternion.copy(groundBody.quaternion);

    boxMesh.position.copy(boxBody.position);
    boxMesh.quaternion.copy(boxBody.quaternion);

    sphereMesh.position.copy(sphereBody.position);
    sphereMesh.quaternion.copy(sphereBody.quaternion);

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
