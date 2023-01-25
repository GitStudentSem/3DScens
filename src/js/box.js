import * as THREE from "three";

const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
export const box = new THREE.Mesh(boxGeometry, boxMaterial);
