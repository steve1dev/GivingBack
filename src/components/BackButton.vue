<template>
  <button
    class="gb-back-btn"
    :class="theme"
    type="button"
    :aria-label="label"
    :title="label"
    @click="goBack"
  >
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  </button>
</template>

<script setup>
/**
 * BackButton
 * Boton de regreso reutilizable, con el mismo diseño y comportamiento
 * que el back-btn original de AccountView (My Account).
 *
 * - theme="onDark"  → para fondos oscuros / con color (por defecto)
 * - theme="onLight" → para fondos claros (tarjetas blancas, paneles crema)
 *
 * Si existe historial de navegacion dentro de la app, regresa a la
 * pantalla anterior; si no (por ejemplo, se entro directo por URL),
 * cae de forma segura a `fallback` (Home por defecto) en lugar de
 * dejar un boton "muerto".
 */
import { useRouter } from 'vue-router'

const props = defineProps({
  to: { type: String, default: null },
  fallback: { type: String, default: '/' },
  theme: { type: String, default: 'onDark' },
  label: { type: String, default: 'Go back' },
})

const router = useRouter()

function goBack() {
  if (props.to) {
    router.push(props.to)
    return
  }
  if (window.history.state && window.history.state.back) {
    router.back()
  } else {
    router.push(props.fallback)
  }
}
</script>

<style scoped>
.gb-back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
}
.gb-back-btn svg { flex-shrink: 0; }
.gb-back-btn:active { transform: translateX(-3px) scale(0.94); }

/* Sobre fondos oscuros / con color: identico al back-btn de My Account */
.gb-back-btn.onDark {
  color: #F1EDE2;
  background: rgba(241, 237, 226, 0.08);
  border: 1px solid rgba(241, 237, 226, 0.25);
}
.gb-back-btn.onDark:hover {
  background: rgba(241, 237, 226, 0.18);
  transform: translateX(-3px);
}

/* Sobre fondos claros: misma interaccion, tonos oscuros para contraste correcto */
.gb-back-btn.onLight {
  color: #0D2B0D;
  background: rgba(13, 43, 13, 0.05);
  border: 1px solid rgba(13, 43, 13, 0.16);
}
.gb-back-btn.onLight:hover {
  background: rgba(13, 43, 13, 0.1);
  border-color: rgba(13, 43, 13, 0.3);
  transform: translateX(-3px);
}

@media (prefers-reduced-motion: reduce) {
  .gb-back-btn { transition: none; }
  .gb-back-btn:hover, .gb-back-btn:active { transform: none; }
}
</style>
