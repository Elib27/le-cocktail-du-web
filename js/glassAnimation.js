import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { HalfFloatType } from "three";
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";


// SETUP

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 5

const rendererCanvas = document.querySelector('#three-canvas')

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  canvas: rendererCanvas,
  stencil: true,
})

renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

const renderPass = new RenderPass(scene, camera)

const bloomPass = new EffectPass(camera, new BloomEffect({intensity: 1}))

// const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {stencilBuffer:true});
// const composer = new EffectComposer(renderer, renderTarget)
const composer = new EffectComposer(renderer, {frameBufferType: HalfFloatType, stencilBuffer: true})
composer.addPass(renderPass)
composer.addPass(bloomPass)

console.log(composer)

// const controls = new OrbitControls(camera, renderer.domElement)


// MODEL LOADER
const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
dracoLoader.setDecoderConfig({ type: 'js' })
gltfLoader.setDRACOLoader(dracoLoader)


// MODELS AND MATERIALS

let glassMesh

const Xoffset = 2.5
const Yoffset = -0.5

gltfLoader.load('threejs_assets/martini_glass.glb', function ( gltf ) {

  const glass = gltf.scene.getObjectByName("martini_glass")
  const glassGeometry = glass.geometry.clone()
  glassMesh = new THREE.Mesh(glassGeometry, glassMaterial)
  glassMesh.scale.set(0.75, 0.75, 0.75)
  glassMesh.position.set(Xoffset, Yoffset, 0)
  scene.add(glassMesh)

  glass.geometry.dispose()
  glass.material.dispose()

}, undefined, function ( error ) {

	console.error( error )

} )

// HDR

const hdrEquirect = new RGBELoader().load(
  "/threejs_assets/empty_warehouse.hdr",
  () => {
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping
  }
)

const textureLoader = new THREE.TextureLoader()
const normalMapTexture = textureLoader.load("threejs_assets/normal.jpg")
normalMapTexture.wrapS = THREE.RepeatWrapping
normalMapTexture.wrapT = THREE.RepeatWrapping


const glassMaterial = new THREE.MeshPhysicalMaterial({
  roughness: 0,
  thickness: 1,
  transmission: 1,
  envMap: hdrEquirect,
  envMapIntensity: 1,
  normalMap: normalMapTexture,
  clearcoatNormalMap: normalMapTexture,
  normalScale: new THREE.Vector2(10),
  stencilWrite: true,
  stencilFunc: THREE.AlwaysStencilFunc,
  stencilRef: 1,
  stencilZPass: THREE.ReplaceStencilOp,
})

// WEBSITE BACKGROUND TEST
const backgroundTexture = new THREE.TextureLoader().load("threejs_assets/page-content.jpg")
const backgroundGeometry = new THREE.PlaneGeometry(38, 20)
const backgroundMaterial = new THREE.MeshBasicMaterial({
  map: backgroundTexture,
  stencilWrite: true,
  stencilRef: 1,
  stencilFunc: THREE.EqualStencilFunc,
  depthWrite: false,
}) 
const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial)
backgroundMesh.position.set(0, 0, -12)
scene.add(backgroundMesh)


// GEOMETRY TEST
const geometry = new THREE.IcosahedronGeometry(1, 0)
const IcosahedronMesh = new THREE.Mesh(geometry, glassMaterial)
IcosahedronMesh.position.set(-1, 0, 0)
// scene.add(IcosahedronMesh)


// ANIMATIONS

const glassAnimations = [
  {
    from: 0,
    to: 100,
    animate: () => {
      backgroundMesh.position.y = 0
    }
  },
  {
    from: 0,
    to: 75,
    animate: (scrollPercentage) => {
      glassMesh.rotation.x = scrollPercentage / 8
    }
  },
  {
    from: 0,
    to: 30,
    animate: (scrollPercentage) => {
      glassMesh.position.x = Xoffset - scrollPercentage / 6
    }
  },
  {
    from: 30,
    to: 55,
    animate: (scrollPercentage) => {
      const lastAnimationX = Xoffset - 30 / 6
      glassMesh.position.x = lastAnimationX + (scrollPercentage - 30) / 5
    }
  },
  {
    from: 55,
    to: 75,
    animate: (scrollPercentage) => {
      const lastAnimationX = Xoffset - 30 / 6 + (55 - 30) / 5
      glassMesh.position.x = lastAnimationX - (scrollPercentage - 55) / 4
    }
  },
  {
    from: 0,
    to: 15,
    animate: (scrollPercentage) => {
      glassMesh.position.z = scrollPercentage / 10
    }
  },
  {
    from: 30,
    to: 50,
    animate: (scrollPercentage) => {
      const lastAnimationZ = 15 / 10
      glassMesh.position.z = lastAnimationZ - (scrollPercentage - 30) / 10
    }
  }
]

function animateGlassOnScroll(scrollPercentage) {
  glassAnimations.forEach(anim => {
    if (scrollPercentage >= anim.from && scrollPercentage < anim.to) {
      anim.animate(scrollPercentage)
    }
  })
}

function animateGlassOnMouseMove(e) {
  if (window.scrollY !== 0) return
  if (glassMesh === undefined) return
  const mouseX = e.clientX - window.innerWidth / 2
  const mouseY = e.clientY - window.innerHeight / 2
  const rotateX = Math.sin(mouseY / window.innerHeight * Math.PI) * Math.PI / 10
  const rotateZ = - Math.sin(mouseX / window.innerWidth * Math.PI) * Math.PI / 20
  glassMesh.position.x = Xoffset - rotateZ*2
  glassMesh.position.y = Yoffset - rotateX
  glassMesh.rotation.x = rotateX
  glassMesh.rotation.z = rotateZ
}

// function animate() {
//   composer.render(scene, camera)
// 	requestAnimationFrame(animate)
// }
// animate()

// WINDOW RESIZE

function updateCanvasOnResize() {
  bloomPass.resolution.set(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  composer.setPixelRatio(window.devicePixelRatio)
  composer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

window.addEventListener('resize', updateCanvasOnResize)


// PAGE LOADER

function hidePageLoader() {
  const pageLoader = document.querySelector('.loader')
  pageLoader.classList.add('hidden')
}

THREE.DefaultLoadingManager.onLoad = hidePageLoader

export { animateGlassOnScroll, animateGlassOnMouseMove }