/**
 * v-reveal
 * Directiva ligera para animar elementos con un suave fade + desplazamiento
 * hacia arriba cuando entran en el viewport. Sin dependencias externas.
 *
 * Uso:
 *   <div v-reveal>...</div>
 *   <div v-reveal="120">...</div>   -> retardo de 120ms (para efecto "stagger")
 *
 * Respeta `prefers-reduced-motion` (ver reglas en main.css).
 */

const observer = typeof IntersectionObserver !== 'undefined'
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
  : null

export const reveal = {
  mounted(el, binding) {
    el.classList.add('reveal-init')
    const delay = typeof binding.value === 'number' ? binding.value : 0
    if (delay) el.style.transitionDelay = `${delay}ms`

    if (!observer) {
      // Entorno sin soporte (SSR, tests): mostrar el elemento directamente
      el.classList.add('reveal-in')
      return
    }
    observer.observe(el)
  },
  unmounted(el) {
    if (observer) observer.unobserve(el)
  },
}

export default reveal
