<template>
  <div class="viz-root bar-chart">
    <p class="viz-subtitle">{{ subtitle }}</p>

    <div class="bar-chart-plot" ref="plotRef">
      <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="none" role="img" :aria-label="ariaSummary">
        <line class="gridline" :x1="padLeft" :x2="width" :y1="yFor(0)" :y2="yFor(0)" />
        <line class="gridline" :x1="padLeft" :x2="width" :y1="yFor(niceMax)" :y2="yFor(niceMax)" />

        <g
          v-for="(m, i) in series"
          :key="m.key"
          tabindex="0"
          role="img"
          :aria-label="`${m.label}: ${roundKg(m.kg)} kilograms`"
          class="bar-group"
          @pointerenter="showTooltip(i, $event)"
          @pointermove="showTooltip(i, $event)"
          @pointerleave="hideTooltip"
          @focus="showTooltip(i, $event)"
          @blur="hideTooltip"
        >
          <path
            :d="barPath(xFor(i), yFor(m.kg), barWidth, Math.max(0, yFor(0) - yFor(m.kg)))"
            class="bar"
            :class="{ hovered: hoveredIndex === i, selected: m.month === highlightMonth }"
          />
          <text
            v-if="i === maxIndex && m.kg > 0"
            :x="xFor(i) + barWidth / 2"
            :y="yFor(m.kg) - 8"
            class="bar-value-label"
            text-anchor="middle"
          >{{ roundKg(m.kg) }}</text>
          <text
            :x="xFor(i) + barWidth / 2"
            :y="height - 6"
            class="axis-label"
            :class="{ selected: m.month === highlightMonth }"
            text-anchor="middle"
          >{{ m.label }}</text>
        </g>
      </svg>

      <div
        v-if="hoveredIndex !== null"
        class="viz-tooltip"
        :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
      >
        <strong>{{ roundKg(series[hoveredIndex].kg) }} kg</strong>
        <span>{{ series[hoveredIndex].label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  series: { type: Array, required: true },
  color: { type: String, default: '#F2C94C' },
  subtitle: { type: String, default: 'Monthly kg recycled' },
  highlightMonth: { type: Number, default: 0 },
})

const width = 460
const height = 220
const padLeft = 6
const padRight = 6
const plotRef = ref(null)
const hoveredIndex = ref(null)
const tooltipX = ref(0)
const tooltipY = ref(0)

const barGap = 8
const barWidth = computed(() => {
  const usable = width - padLeft - padRight
  const raw = usable / props.series.length - barGap
  return Math.max(8, Math.min(28, raw))
})

const niceMax = computed(() => {
  const rawMax = Math.max(0, ...props.series.map((m) => m.kg))
  if (rawMax <= 0) return 1
  const magnitude = 10 ** Math.floor(Math.log10(rawMax))
  const step = magnitude / 2 || 0.1
  const ceil = Math.ceil((rawMax * 1.05) / step) * step
  return Number(ceil.toFixed(2))
})

const maxIndex = computed(() => {
  let best = 0
  props.series.forEach((m, i) => {
    if (m.kg > props.series[best].kg) best = i
  })
  return best
})

const plotTop = 16
const plotBottom = height - 34

function xFor(i) {
  const usable = width - padLeft - padRight
  const slot = usable / props.series.length
  return padLeft + i * slot + (slot - barWidth.value) / 2
}

function yFor(value) {
  const ratio = value / niceMax.value
  return plotBottom - ratio * (plotBottom - plotTop)
}

// Rounded data-end at the top, square baseline (mark spec) — a plain <rect rx>
// would round the baseline corners too, so this draws the top corners only.
function barPath(x, y, w, h) {
  if (h <= 0) return ''
  const r = Math.min(4, w / 2, h)
  const bottom = y + h
  return `M${x},${bottom} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${bottom} Z`
}

function roundKg(value) {
  return Number(value || 0).toFixed(1)
}

const ariaSummary = computed(() => {
  return `Bar chart: ${props.series.map((m) => `${m.label} ${roundKg(m.kg)} kilograms`).join(', ')}`
})

function showTooltip(index, event) {
  hoveredIndex.value = index
  const container = plotRef.value
  if (!container) return
  const containerRect = container.getBoundingClientRect()
  const targetRect = event.currentTarget.getBoundingClientRect()
  tooltipX.value = targetRect.left - containerRect.left + targetRect.width / 2
  tooltipY.value = targetRect.top - containerRect.top
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
  --baseline: #c3c2b7;
}

.bar-chart {
  background: var(--surface-1);
  border-radius: 16px;
  padding: 16px 16px 10px;
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

.bar-chart-plot { position: relative; }
svg { display: block; width: 100%; height: 200px; }

.gridline { stroke: var(--gridline); stroke-width: 1; }

.bar {
  fill: v-bind(color);
  transition: opacity 0.2s ease, stroke 0.2s ease;
}
.bar-group { cursor: pointer; outline: none; }
.bar-group:focus-visible .bar,
.bar.hovered { opacity: 0.75; }
.bar.selected {
  stroke: var(--text-primary);
  stroke-width: 1.5;
}

.bar-value-label {
  font-size: 13px;
  font-weight: 700;
  fill: var(--text-primary);
}
.axis-label {
  font-size: 11px;
  fill: var(--text-muted);
}
.axis-label.selected {
  fill: var(--text-primary);
  font-weight: 700;
}

.viz-tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  margin-top: -6px;
  background: var(--text-primary);
  color: #fff;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  pointer-events: none;
  z-index: 2;
  box-shadow: 0 6px 14px rgba(0,0,0,0.25);
}
.viz-tooltip strong { font-size: 0.86rem; }
.viz-tooltip span { font-size: 0.68rem; opacity: 0.75; }
</style>
