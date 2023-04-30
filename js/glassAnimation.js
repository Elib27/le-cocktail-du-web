import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'


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

// 3D glass model draco loader (compressed glb)

const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
dracoLoader.setDecoderConfig({ type: 'js' })
gltfLoader.setDRACOLoader(dracoLoader)


// Models and materials

let glassMesh

const glassXoffset = 2.5
const glassYoffset = -0.5

gltfLoader.load('threejs_assets/martini_glass.glb', function ( gltf ) {

  const glass = gltf.scene.getObjectByName("martini_glass")
  const glassGeometry = glass.geometry.clone()
  glassMesh = new THREE.Mesh(glassGeometry, glassMaterial)

  glassMesh.scale.set(0.75, 0.75, 0.75)
  glassMesh.position.set(glassXoffset, glassYoffset, 0)

  firstSynchroPositionToScroll()

  scene.add(glassMesh)

  glass.geometry.dispose()
  glass.material.dispose()

}, undefined, function ( error ) {

	console.error( error )

})

function firstSynchroPositionToScroll() {
  const endScrollElement = document.querySelector('#cocktails')
  const scrollEnd = endScrollElement.offsetTop
  const scrollPercentage = window.scrollY / scrollEnd * 100
  animateGlassOnScroll(scrollPercentage)
}

// HDR environment map (for glass reflexion)

const hdrEquirect = new RGBELoader().load(
  "threejs_assets/empty_warehouse.hdr",
  () => {
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping
  }
)

// Normal map glass texture

const textureLoader = new THREE.TextureLoader()
const normalMapTexture = textureLoader.load("threejs_assets/normal.webp")
normalMapTexture.wrapS = THREE.RepeatWrapping
normalMapTexture.wrapT = THREE.RepeatWrapping
normalMapTexture.repeat.set(2,2)

// Glass material

const glassMaterial = new THREE.MeshPhysicalMaterial({
  roughness: 0.1,
  thickness: 1,
  transmission: 1,
  envMap: hdrEquirect,
  envMapIntensity: 1,
  normalMap: normalMapTexture,
  clearcoatNormalMap: normalMapTexture,
  normalScale: new THREE.Vector2(0.3),
  stencilWrite: true,
  stencilFunc: THREE.AlwaysStencilFunc,
  stencilRef: 1,
  stencilZPass: THREE.ReplaceStencilOp,
})

// Fake website background

let backgroundTexture
let backgroundMesh
let bgYoffset = -30
let bgYend = 48

function setBackgroundMesh() {
  if (window.innerWidth < 700) { // on mobile
    backgroundTexture = new THREE.TextureLoader().load("threejs_assets/page-content-mobile.webp")
    const backgroundGeometry = new THREE.PlaneGeometry(11, 86, 8)
    const backgroundMaterial = new THREE.MeshBasicMaterial({
      map: backgroundTexture,
      stencilWrite: true,
      stencilRef: 1,
      stencilFunc: THREE.EqualStencilFunc,
      depthWrite: false,
    }) 
    backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial)
    bgYoffset = -31
    bgYend = 53
    backgroundMesh.position.set(0, bgYoffset, -10)
  }
  else { // on desktop
    backgroundTexture = new THREE.TextureLoader().load("threejs_assets/page-content.webp")
    const backgroundGeometry = new THREE.PlaneGeometry(40, 84, 8)
    const backgroundMaterial = new THREE.MeshBasicMaterial({
      map: backgroundTexture,
      stencilWrite: true,
      stencilRef: 1,
      stencilFunc: THREE.EqualStencilFunc,
      depthWrite: false,
    }) 
    backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterial)
    bgYoffset = -30
    bgYend = 48
    backgroundMesh.position.set(0, bgYoffset, -10)
  }
}

setBackgroundMesh()

scene.add(backgroundMesh)

// Glass Animations

const glassAnimations = [
  {
    from: 0,
    to: 100,
    animate: (scrollPercentage) => {
      backgroundMesh.position.y = bgYoffset + scrollPercentage * (bgYend - bgYoffset) / 100
    }
  },
  {
    from: 0,
    to: 90,
    animate: (scrollPercentage) => {
      glassMesh.rotation.x = scrollPercentage / 8
    }
  },
  {
    from: 0,
    to: 30,
    animate: (scrollPercentage) => {
      glassMesh.position.x = glassXoffset - scrollPercentage / 6
    }
  },
  {
    from: 30,
    to: 50,
    animate: (scrollPercentage) => {
      const lastAnimationX = glassXoffset - 30 / 6
      glassMesh.position.x = lastAnimationX + (scrollPercentage - 30) / 4
    }
  },
  {
    from: 50,
    to: 90,
    animate: (scrollPercentage) => {
      const lastAnimationX = glassXoffset - 30 / 6 + (50 - 30) / 4
      glassMesh.position.x = lastAnimationX - (scrollPercentage - 50) / 2
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
  },
  { // fallback case (go to animation end)
    from: 90,
    to: 9999,
    animate: () => {
      const finalPositionX = -20
      glassMesh.position.x = finalPositionX
    }
  }
]

function animateGlassOnScroll(scrollPercentage) {
  if (glassMesh === undefined) return
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
  glassMesh.position.x = glassXoffset - rotateZ*2
  glassMesh.position.y = glassYoffset - rotateX
  glassMesh.rotation.x = rotateX
  glassMesh.rotation.z = rotateZ
}

function animate() {
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}
animate()

// Window resize

function updateCanvasOnResize() {
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
}

window.addEventListener('resize', updateCanvasOnResize)


// Page loader

function hidePageLoader() {
  const pageLoader = document.querySelector('.loader')
  pageLoader.classList.add('hidden')
}

function launchTitleAnimation() {
  const headerHeroSection = document.querySelector('#header-hero')
  headerHeroSection.classList.remove('paused')
}

function onLoad() {
  hidePageLoader()
  launchTitleAnimation()
}

THREE.DefaultLoadingManager.onLoad = onLoad

export { animateGlassOnScroll, animateGlassOnMouseMove }