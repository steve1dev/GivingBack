<template>
  <div class="viz-root donut-chart">
    <p class="viz-subtitle">{{ subtitle }}</p>

    <div v-if="totalKg <= 0" class="donut-empty">No recycling logged for this period.</div>

    <div v-else class="donut-body" ref="plotRef">
      <svg viewBox="0 0 200 200" class="donut-svg">
        <circle cx="100" cy="100" :r="radius" class="donut-track" :stroke-width="strokeWidth" />
        <g
          v-for="(slice, i) in arcs"
          :key="slice.category"
          tabindex="0"
          role="img"
          :aria-label="`${slice.category}: ${roundKg(slice.kg)} kilograms, ${slice.percent}%`"
          class="donut-arc-group"
          @pointerenter="showTooltip(i, $event)"
          @pointermove="showTooltip(i, $event)"
          @pointerleave="hideTooltip"
          @focus="showTooltip(i, $event)"
          @blur="hideTooltip"
        >
          <circle
            cx="100" cy="100" :r="radius"
            :stroke="slice.color"
            :stroke-width="hoveredIndex === i ? strokeWidth + 4 : strokeWidth"
            :stroke-dasharray="`${slice.dash} ${circumference - slice.dash}`"
            :stroke-dashoffset="slice.offset"
            class="donut-arc"
            fill="none"
          />
        </g>
        <text x="100" y="94" text-anchor="middle" class="donut-total-kg">{{ roundKg(totalKg) }}</text>
        <text x="100" y="116" text-anchor="middle" class="donut-total-unit">kg total</text>
      </svg>

      <div
        v-if="hoveredIndex !== null"
        class="viz-tooltip"
        :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
      >
        <strong>{{ roundKg(arcs[hoveredIndex].kg) }} kg</strong>
        <span>{{ arcs[hoveredIndex].category }} &middot; {{ arcs[hoveredIndex].percent }}%</span>
      </div>
    </div>

    <ul v-if="totalKg > 0" class="donut-legend">
      <li v-for="slice in arcs" :key="slice.category">
        <span class="legend-swatch" :style="{ background: slice.color }"></span>
        {{ slice.category }} <b>{{ roundKg(slice.kg) }} kg</b>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  slices: { type: Array, required: true },
  subtitle: { type: String, default: 'Material mix' },
})

const radius = 78
const strokeWidth = 24
const circumference = 2 * Math.PI * radius
const plotRef = ref(null)
const hoveredIndex = ref(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

const totalKg = computed(() => props.slices.reduce((sum, s) => sum + s.kg, 0))

const arcs = computed(() => {
  let cumulative = 0
  return props.slices
    .filter((s) => s.kg > 0)
    .map((slice) => {
      const fraction = totalKg.value > 0 ? slice.kg / totalKg.value : 0
      const dash = fraction * circumference
      const offset = -cumulative + circumference / 4
      cumulative += dash
      return {
        ...slice,
        dash,
        offset,
        percent: Math.round(fraction * 100),
      }
    })
})

function roundKg(value) {
  return Number(value || 0).toFixed(1)
}

function showTooltip(index, event) {
  hoveredIndex.value = index
  const container = plotRef.value
  if (!container) return
  const containerRect = container.getBoundingClientRect()
  const targetRect = event.currentTarget.getBoundingClientRect()
  tooltipX.value = targetRect.left - containerRect.left + targetRect.width / 2
  tooltipY.value = targetRect.top - containerRect.top + targetRect.height / 2
}

function hideTooltip() {
  hoveredIndex.value = null
}
</script>

<style scoped>
.viz-root {
  color-scheme: light;
  --surface-1: #fcfcfb;
  --text-primary: #0b0b0b;
  --text-secondary: #52514e;
  --text-muted: #898781;
  --gridline: #e1e0d9;
}

.donut-chart {
  background: var(--surface-1);
  border-radius: 16px;
  padding: 16px;
  height: 100%;
}

.viz-subtitle {
  margin: 0 0 8px;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--text-secondary);
}

.donut-empty {
  font-size: 0.85rem;
  color: var(--text-muted);
  padding: 40px 0;
  text-align: center;
}

.donut-body { position: relative; display: flex; justify-content: center; }
.donut-svg { width: 200px; height: 200px; max-width: 100%; }

.donut-track { fill: none; stroke: var(--gridline); }
.donut-arc { transition: stroke-width 0.2s ease; }
.donut-arc-group { cursor: pointer; outline: none; }

.donut-total-kg { font-size: 26px; font-weight: 700; fill: var(--text-primary); }
.donut-total-unit { font-size: 11px; fill: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }

.donut-legend {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  justify-content: center;
  font-size: 0.82rem;
  color: var(--text-secondary);
}
.donut-legend li { display: flex; align-items: center; gap: 6px; }
.donut-legend b { color: var(--text-primary); }
.legend-swatch { width: 11px; height: 11px; border-radius: 3px; flex-shrink: 0; }

.viz-tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  margin-top: -8px;
  background: var(--text-primary);
  color: #fff;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
  z-index: 2;
  box-shadow: 0 6px 14px rgba(0,0,0,0.25);
}
.viz-tooltip strong { font-size: 0.86rem; }
.viz-tooltip span { font-size: 0.68rem; opacity: 0.75; }
</style>
