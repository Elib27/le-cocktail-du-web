import Lenis from '@studio-freight/lenis'
import { animateGlassOnScroll } from './glassAnimation'

function initSmoothScroll() {

  // Lenis setup

  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 0.75
  })

  window.lenis = lenis

  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  // Animation on scroll

  function onAnimatedScroll(endScrollElement, scrollYpx) {
    const scrollEnd = endScrollElement.offsetTop
    const scrollPercentage = scrollYpx / scrollEnd * 100
    animateGlassOnScroll(scrollPercentage)
  }

  const cocktailsSection = document.querySelector('#cocktails')

  lenis.on('scroll', (e) => onAnimatedScroll(cocktailsSection, e.animatedScroll))

  // Page links smooth scroll
  
  const anchors = document.querySelectorAll('a[href^="#"]')

  anchors.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      lenis.scrollTo(this.getAttribute('href'), {lerp: 0.075})
    })
  })
}

export { initSmoothScroll }