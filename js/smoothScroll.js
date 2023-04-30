import Lenis from '@studio-freight/lenis'
import { animateGlassOnScroll } from './glassAnimation'

function initSmoothScroll() {

  const lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 0.75
  })

  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  // Animation

  const cocktailsSection = document.querySelector('#cocktails')

  function onAnimatedScroll(endScrollElement, scrollYpx) {
    const scrollEnd = endScrollElement.offsetTop
    const scrollPercentage = scrollYpx / scrollEnd * 100
    animateGlassOnScroll(scrollPercentage)
  }

  window.lenis = lenis

  lenis.on('scroll', (e) => onAnimatedScroll(cocktailsSection, e.animatedScroll))

  // Page links
  const anchors = document.querySelectorAll('a[href^="#"]')

  anchors.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      lenis.scrollTo(this.getAttribute('href'), {lerp: 0.075})
    })
  })
}

export { initSmoothScroll }