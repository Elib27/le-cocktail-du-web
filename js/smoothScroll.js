import Lenis from '@studio-freight/lenis'
import { animateGlassOnScroll } from './glassAnimation'

function initSmoothScroll() {

  const lenis = new Lenis({
    lerp: 0.1,
    mouseMultiplier: 0.75,
    // duration: 1,
    // easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  })

  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  // Animation

  const cocktailsSection = document.querySelector('#cocktails')

  lenis.on('scroll', (e) => {
    const scrollEnd = cocktailsSection.offsetTop
    const scrollPercentage = e.animatedScroll / scrollEnd * 100
    animateGlassOnScroll(scrollPercentage)
  })

  // Page links
  const anchors = document.querySelectorAll('a[href^="#"]')

  anchors.forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      lenis.scrollTo(this.getAttribute('href'))
    })
  })
}

export { initSmoothScroll }