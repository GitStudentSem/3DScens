import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils.js";

const modelUrl = new URL("../assets/Stag.gltf", import.meta.url);

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setClearColor(0xa3a3a3);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(10, 6, 10);
orbit.update();

// LIGHT
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionLight);
directionLight.position.set(3, 3, 3);
//---LIGHT

const assetLoader = new GLTFLoader();

let stag;
let clips;
assetLoader.load(
    modelUrl.href,
    (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.3, 0.3, 0.3);
        stag = model;
        clips = gltf.animations;
    },
    undefined,
    (err) => {
        console.log("err", err);
    }
);
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

const addedObects = [];
const mixers = [];
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
                const stagClone = SkeletonUtils.clone(stag);
                stagClone.position.copy(hightlightMesh.position);
                scene.add(stagClone);
                addedObects.push(stagClone);
                hightlightMesh.material.color.setHex(0xff0000);

                const mixer = new THREE.AnimationMixer(stagClone);
                const clip = THREE.AnimationClip.findByName(clips, "Idle_2");
                const action = mixer.clipAction(clip);
                action.play();
                mixers.push(mixer);
            }
        });
    }
});

const clock = new THREE.Clock();
function animate(time) {
    hightlightMesh.material.opacity = 1 + Math.sin(time / 120);
    const delta = clock.getDelta();
    mixers.forEach((mixer) => {
        mixer.update(delta);
    });
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
