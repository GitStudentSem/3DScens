// npx parcel ./src/index.html
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import nebula from "../img/nebula.jpeg";
import stars from "../img/stars.jpeg";

const monkeyUrl = new URL("../assets/monkey.glb", import.meta.url);
// import { box } from "./sphere";

const renderer = new THREE.WebGLRenderer();

renderer.shadowMap.enabled = true;

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    745,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

//Ось X красная. Ось Y зеленого цвета. Ось Z синего цвета
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

//x y z
camera.position.set(-10, 30, 30);
orbit.update();

const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

//  ШАР
const sphereGeometry = new THREE.SphereGeometry(4, 30, 30);
const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 0x0000ff,
    wireframe: false, // показывать грани
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.position.set(-10, 10, 0);
sphere.castShadow = true;

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffffff);
scene.add(spotLight);
spotLight.position.set(-50, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.1;

const sLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(sLightHelper);

scene.fog = new THREE.FogExp2(0xffffff, 0.001);

const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
scene.background = cubeTextureLoader.load([
    stars,
    stars,
    stars,
    stars,
    stars,
    stars,
]);

const box2Geometry = new THREE.BoxGeometry(4, 4, 4);
const box2MultiMaterial = [
    new THREE.MeshBasicMaterial({
        map: textureLoader.load(stars),
    }),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load(nebula),
    }),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load(stars),
    }),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load(stars),
    }),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load(stars),
    }),
    new THREE.MeshBasicMaterial({
        map: textureLoader.load(nebula),
    }),
];
const box2 = new THREE.Mesh(box2Geometry, box2MultiMaterial);
scene.add(box2);
box2.castShadow = true;
box2.position.set(0, 15, 10);
box2.material.map = textureLoader.load(nebula);

const plane2Geometry = new THREE.PlaneGeometry(10, 10, 10, 10);
const plane2Material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    wireframe: true,
});
const plane2 = new THREE.Mesh(plane2Geometry, plane2Material);
scene.add(plane2);
plane2.position.set(10, 10, 15);

const sphere2Geometry = new THREE.SphereGeometry(4);
const sphere2Material = new THREE.ShaderMaterial({
    vertexShader: document.getElementById("vertexShader").textContent,
    fragmentShader: document.getElementById("fragmentShader").textContent,
});
const sphere2 = new THREE.Mesh(sphere2Geometry, sphere2Material);
scene.add(sphere2);
sphere2.position.set(-5, 10, 10);

const assetLoader = new GLTFLoader();

assetLoader.load(
    monkeyUrl.href,
    (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        model.position.set(-12, 4, 10);
    },
    undefined,
    (error) => {
        console.error("err", error);
    }
);

const gui = new dat.GUI();

// Настройки для сцены
const options = {
    sphereColor: "#ffea00",
    wireframe: false,
    speed: 0.01,

    // настройки света
    angle: 0.09,
    penumbra: 0.7,
    intensity: 1,
};

// создание рычагов управления
gui.addColor(options, "sphereColor").onChange(function (e) {
    sphere.material.color.set(e);
});
gui.add(options, "wireframe").onChange(function (e) {
    sphere.material.wireframe = e;
});
gui.add(options, "speed", 0, 0.1);

// настройки света
gui.add(options, "angle", 0, 1);
gui.add(options, "penumbra", 0, 1);
gui.add(options, "intensity", 0, 1);

let step = 0;

function animate(time) {
    box.rotation.x = time / 1000;
    box.rotation.y = time / 1000;
    step += options.speed;
    sphere.position.y = 10 * Math.abs(Math.sin(step)) + 4;

    spotLight.angle = options.angle;
    spotLight.penumbra = options.penumbra;
    spotLight.intensity = options.intensity;
    sLightHelper.update();

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
