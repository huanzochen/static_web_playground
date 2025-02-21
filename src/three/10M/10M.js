import * as THREE from 'three';

// build scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth - 20, window.innerHeight - 20)
document.getElementById('app').appendChild(renderer.domElement)

// create 10M point
const numPoints = 10_000_000
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array(numPoints * 3); // XYZ for each point
const colors = new Float32Array(numPoints * 3);

for (let i = 0; i < vertices.length; i++){
  vertices[i * 3] = (Math.random() - 0.5) * 100
  vertices[i * 3 + 1] = (Math.random() - 0.5) * 100
  vertices[i * 3 + 2] = (Math.random() - 0.5) * 100

  colors[i * 3] = Math.random();
  colors[i * 3 + 1] = Math.random()
  colors[i * 3 + 2] = Math.random();
}

geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

const material = new THREE.PointsMaterial({
  size: 0.01,
  vertexColors: true
})
const points = new THREE.Points(geometry, material)
scene.add(points)

camera.position.z = 100;

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera)
}
animate()