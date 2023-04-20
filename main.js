import './style.scss'

import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderCanvas = document.querySelector('#three-canvas')

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  canvas: renderCanvas,
  stencil: true,
});


const controls = new OrbitControls( camera, renderer.domElement );
renderer.setSize( window.innerWidth, window.innerHeight );

const loader = new GLTFLoader();

loader.load('/martini-glass.glb', function ( gltf ) {

  const glass = gltf.scene.children.find(name => name.name === "martini_Cube014")
  const glassGeometry = glass.geometry.clone()
  const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial)
  glassMesh.position.set(13.5, -1, 10)
  glassMesh.scale.set(10, 10, 10)
	scene.add(glassMesh);

  glass.geometry.dispose();
  glass.material.dispose();

}, undefined, function ( error ) {

	console.error( error );

} );

// ne fonctionne pas
// const hdrEquirect = new RGBELoader().load(
//   "/empty_warehouse.hdr",
//   () => {
//     hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
//   }
// );

const textureLoader = new THREE.TextureLoader();
const normalMapTexture = textureLoader.load("/normal.jpg");
// normalMapTexture.repeat.set(2,2)
normalMapTexture.wrapS = THREE.RepeatWrapping;
normalMapTexture.wrapT = THREE.RepeatWrapping;

// TEXTURE TEST
const bgTexture = new THREE.TextureLoader().load("/page-content.jpg");
const bgGeometry = new THREE.PlaneGeometry(38, 20);
const bgMaterial = new THREE.MeshBasicMaterial({
  map: bgTexture,
  stencilWrite: true,
  stencilRef: 1,
  stencilFunc: THREE.EqualStencilFunc,
  depthWrite: false,
}); 
const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
bgMesh.position.set(0, 0, -12);
scene.add(bgMesh);


const glassMaterial = new THREE.MeshPhysicalMaterial({
  roughness: 0,
  thickness: 0.5,
  transmission: 1,
  // envMap: hdrEquirect,
  normalMap: normalMapTexture, // intensity ?
  normalScale: new THREE.Vector2(1),
  clearcoatNormalMap: normalMapTexture,
  stencilWrite: true,
  stencilFunc: THREE.AlwaysStencilFunc,
  stencilRef: 1,
  stencilZPass: THREE.ReplaceStencilOp,
});

// GEOMETRY TEST
const geometry = new THREE.IcosahedronGeometry(1, 0);
const IcosahedronMesh = new THREE.Mesh(geometry, glassMaterial)
IcosahedronMesh.position.set(-1, 0, 0)
scene.add(IcosahedronMesh);

// LIGHTS
const light = new THREE.DirectionalLight(0xffffff, 1); // soft white light
light.position.set(0, 5, 10);
scene.add(light);

camera.position.z = 5;


function animate() {
	requestAnimationFrame( animate );
  IcosahedronMesh.rotation.x += 0.01;
  IcosahedronMesh.rotation.y += 0.02;
  renderer.render( scene, camera );
}
animate();


function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);