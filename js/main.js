import '../styles/main.scss'
import { initSmoothScroll } from './smoothScroll'
import { animateGlassOnMouseMove } from './glassAnimation'

// Smooth scroll and glass animation

initSmoothScroll()

window.addEventListener('mousemove', animateGlassOnMouseMove)


// Toggable navigation menu

const menu = document.querySelector('.menu-nav')

const toggleMenu = () => menu.classList.toggle('open')
menu.addEventListener('click', toggleMenu)

const closeMenuClickOutside = (e) => {
  if (menu.contains(e.target)) return
  menu.classList.remove('open')
}
document.addEventListener('click', closeMenuClickOutside)