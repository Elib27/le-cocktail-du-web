import '../styles/main.scss'
import { initSmoothScroll } from './smoothScroll'
import { animateGlassOnMouseMove } from './glassAnimation'

// Smooth scroll and animation

initSmoothScroll()

window.addEventListener('mousemove', animateGlassOnMouseMove)

// Toggable Menu

const menu = document.querySelector('.menu-nav')

const toggleMenu = () => menu.classList.toggle('open')

const closeMenuClickOutside = (e) => {
  if (menu.contains(e.target)) return
  menu.classList.remove('open')
}

menu.addEventListener('click', toggleMenu)
document.addEventListener('click', closeMenuClickOutside)