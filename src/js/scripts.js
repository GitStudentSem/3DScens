// npx parcel ./index.html
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as dat from "dat.gui";

const fileUrl = new URL("../assets/Donkey.gltf", import.meta.url);

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

renderer.setClearColor(0xa3a3a3);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(10, 10, 10);
orbit.update();

const grid = new THREE.GridHelper(30, 30);
scene.add(grid);

const ambientLight = new THREE.AmbientLight(0xededed, 0.8);
scene.add(ambientLight);

const directionLight = new THREE.DirectionalLight(0xffffff, 1);
scene.add(directionLight);
directionLight.position.set(10, 11, 7);

const gui = new dat.GUI();

const options = {
    Main: 0x2f3130,
    "Main light": 0x7c7c7c,
    "Main dark": 0x0a0a0a,
    Hooves: 0x0f0b0d,
    Hair: 0x0a0a0a,
    Muzzle: 0x0b0804,
    "Eye dark": 0x020202,
    "Eye white": 0xbebebe,
};

const assetLoader = new GLTFLoader();

assetLoader.load(
    fileUrl.href,
    (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        console.log(model.getObjectByName("Cube_1"));
        gui.addColor(options, "Main").onChange((e) => {
            model.getObjectByName("Cube").material.color.setHex(e);
        });
        gui.addColor(options, "Main light").onChange((e) => {
            model.getObjectByName("Cube_1").material.color.setHex(e);
        });
        gui.addColor(options, "Main dark").onChange((e) => {
            model.getObjectByName("Cube_2").material.color.setHex(e);
        });
        gui.addColor(options, "Hooves").onChange((e) => {
            model.getObjectByName("Cube_3").material.color.setHex(e);
        });
        gui.addColor(options, "Hair").onChange((e) => {
            model.getObjectByName("Cube_4").material.color.setHex(e);
        });
        gui.addColor(options, "Muzzle").onChange((e) => {
            model.getObjectByName("Cube_5").material.color.setHex(e);
        });
        gui.addColor(options, "Eye dark").onChange((e) => {
            model.getObjectByName("Cube_6").material.color.setHex(e);
        });
        gui.addColor(options, "Eye white").onChange((e) => {
            model.getObjectByName("Cube_7").material.color.setHex(e);
        });
    },
    undefined,
    (err) => {
        console.log("err", err);
    }
);

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
