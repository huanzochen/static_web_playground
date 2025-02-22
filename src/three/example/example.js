import * as THREE from 'three';

// 建立場景
const scene = new THREE.Scene();

// 創建正交相機（模擬 2D）
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
    -aspect * 10, aspect * 10, 10, -10, 0.1, 1000
);
camera.position.z = 10; // 放置相機在正面

// 建立渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 256;
canvas.height = 256;

// 畫一個簡單的 2D 圖形
ctx.fillStyle = "blue";
ctx.fillRect(50, 50, 150, 150);
ctx.fillStyle = "white";
ctx.font = "30px Arial";
ctx.fillText("2D!", 90, 140);

// 轉換成 Three.js 紋理
const texture = new THREE.CanvasTexture(canvas);
const geometry = new THREE.PlaneGeometry(5, 5);
const material = new THREE.MeshBasicMaterial({ map: texture });

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

// 繪製場景
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();