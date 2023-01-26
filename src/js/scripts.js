// npx parcel ./index.html
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

camera.position.set(10, 15, -22);
orbit.update();

// CREATE PLANE
const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, visible: false })
);
planeMesh.rotateX(-Math.PI / 2);
scene.add(planeMesh);
planeMesh.name = "ground";

const grid = new THREE.GridHelper(20, 20);
scene.add(grid);
//--- CREATE PLANE

// SQUARE
const hightlightMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, transparent: true })
);
hightlightMesh.rotateX(-Math.PI / 2);
hightlightMesh.position.set(0.5, 0, 0.5);
scene.add(hightlightMesh);
//---SQUARE

const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;

window.addEventListener("mousemove", (e) => {
    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObjects(scene.children);
    intersects.forEach((intersect) => {
        if (intersect.object.name === "ground") {
            const hightlightPos = new THREE.Vector3()
                .copy(intersect.point)
                .floor()
                .addScalar(0.5);
            hightlightMesh.position.set(hightlightPos.x, 0, hightlightPos.z);

            const objectExist = addedObects.find((object) => {
                return (
                    object.position.x === hightlightMesh.position.x &&
                    object.position.z === hightlightMesh.position.z
                );
            });

            if (!objectExist) {
                hightlightMesh.material.color.setHex(0xffffff);
            } else {
                hightlightMesh.material.color.setHex(0xff0000);
            }
        }
    });
});

const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 4, 2),
    new THREE.MeshBasicMaterial({ wireframe: true, color: 0xffea00 })
);

const addedObects = [];
window.addEventListener("click", () => {
    const objectExist = addedObects.find((object) => {
        return (
            object.position.x === hightlightMesh.position.x &&
            object.position.z === hightlightMesh.position.z
        );
    });

    if (!objectExist) {
        intersects.forEach((intersect) => {
            if (intersect.object.name === "ground") {
                const sphereClone = sphereMesh.clone();
                sphereClone.position.copy(hightlightMesh.position);
                scene.add(sphereClone);
                addedObects.push(sphereClone);
                hightlightMesh.material.color.setHex(0xff0000);
            }
        });
    }
});

function animate(time) {
    hightlightMesh.material.opacity = 1 + Math.sin(time / 120);
    addedObects.forEach((object) => {
        object.rotation.x = time / 1000;
        object.rotation.z = time / 1000;
        object.position.y = 0.5 + 0.5 * Math.abs(Math.sin(time / 1000));
    });
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
