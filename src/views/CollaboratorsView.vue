<template>
  <TheNavbar />

  <section class="collab-page">
    <div class="collab-topbar">
      <BackButton theme="onDark" fallback="/" label="Back" />
      <div class="collab-wordmark">Our <span>Collaborators</span></div>
      <div class="collab-spacer" aria-hidden="true"></div>
    </div>

    <header class="collab-hero">
      <p class="eyebrow">Community impact &middot; leaderboard</p>
      <h1>Who's recycling the most?</h1>
      <p class="subtitle">
        Every scan logged in Giving Back is credited to the partner behind it — ranked by kg
        recycled for whatever period you pick below.
      </p>
    </header>

    <div v-if="loading" class="state-banner">Loading collaborator data...</div>
    <div v-else-if="errorMessage" class="state-banner error">{{ errorMessage }}</div>
    <div v-else-if="collaborators.length === 0" class="state-banner">No collaborators yet.</div>

    <template v-else>
      <div class="collab-filters">
        <label>
          <span>Year</span>
          <select v-model.number="selectedYear">
            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
          </select>
        </label>
        <label>
          <span>Month</span>
          <select v-model.number="selectedMonth">
            <option :value="0">All months</option>
            <option v-for="(m, i) in MONTH_LABELS" :key="m" :value="i + 1">{{ m }}</option>
          </select>
        </label>
      </div>

      <div class="collab-list">
        <article
          v-for="(c, i) in rankedViewModels"
          :id="`collaborator-${c.slug}`"
          :key="c.id"
          class="collab-panel"
          :class="{ leading: i === 0 && rankedViewModels.length > 1, highlighted: c.slug === highlightedSlug }"
        >
          <div class="panel-hero">
            <span v-if="rankedViewModels.length > 1" class="rank-badge">#{{ i + 1 }}</span>

            <div class="seal">
              <img :src="c.logo_url" :alt="c.name" class="seal-img" />
              <span class="seal-badge" v-html="ICON_LEAF"></span>
            </div>

            <div class="panel-identity">
              <p class="panel-eyebrow">Collaborator</p>
              <h2>{{ c.name }}</h2>
            </div>

            <div class="panel-hero-stat">
              <p class="hero-number">{{ roundKg(c.totalKg) }}<span>kg</span></p>
              <p class="hero-caption">recycled &middot; lifetime</p>
            </div>
          </div>

          <div class="panel-body">
            <div class="panel-materials">
              <p class="panel-section-label">Materials &middot; lifetime</p>
              <ul v-if="c.materials.length" class="material-list">
                <li v-for="material in c.materials" :key="material.category" :style="{ '--m-color': material.color }">
                  <span class="material-icon" v-html="material.icon"></span>
                  <span class="material-name">{{ material.category }}</span>
                  <span class="material-bar"><span class="material-bar-fill" :style="{ width: materialShare(c, material) + '%' }"></span></span>
                  <span class="material-kg">{{ roundKg(material.kg) }} kg</span>
                </li>
              </ul>
              <p v-else class="collab-empty">No recycling logged yet.</p>
            </div>

            <div class="panel-divider" aria-hidden="true"></div>

            <div class="panel-stats">
              <p class="panel-section-label">Recycling stats &middot; {{ periodLabel }}</p>
              <div class="collab-stats-charts">
                <MonthlyKgBarChart
                  :series="c.yearlySeries"
                  :subtitle="`Monthly kg recycled · ${selectedYear}`"
                  :highlight-month="selectedMonth"
                />
                <MaterialShareDonutChart
                  :slices="c.periodMaterialSlices"
                  :subtitle="`Material mix · ${periodLabel}`"
                />
              </div>
            </div>
          </div>
        </article>
      </div>
    </template>

    <p class="closing-phrase">
      <span>Thank you</span> to every collaborator turning recycled materials into real community impact.
    </p>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import TheNavbar from '../components/TheNavbar.vue'
import BackButton from '../components/BackButton.vue'
import MonthlyKgBarChart from '../components/charts/MonthlyKgBarChart.vue'
import MaterialShareDonutChart from '../components/charts/MaterialShareDonutChart.vue'
import { getInsforgeClient } from '../stores/auth.js'
import { MONTH_LABELS, buildMaterialSlices, buildYearlySeries, filterRowsByPeriod } from '../utils/collaboratorStats.js'

const route = useRoute()
const loading = ref(true)
const errorMessage = ref('')
const collaborators = reactive([])
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(0)

const highlightedSlug = computed(() => {
  const value = route.query.collaborator
  return typeof value === 'string' ? value : ''
})

const ICON_BOTTLE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6v3.2c0 .5.2.9.5 1.3l1 1.2c.6.7 1 1.6 1 2.6V19a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3V10.3c0-1 .4-1.9 1-2.6l1-1.2c.3-.4.5-.8.5-1.3V2Z"/><path d="M9 2h6"/><path d="M8.5 11h7"/></svg>'
const ICON_BOX = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5 12 4l9 4.5"/><path d="M3 8.5v9L12 22l9-4.5v-9"/><path d="M3 8.5 12 13l9-4.5"/><path d="M12 13v9"/></svg>'
const ICON_GLASS = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2h8l1 6-4 4v8h-2v-8l-4-4 1-6Z"/></svg>'
const ICON_CAN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4c0-1 2.7-2 6-2s6 1 6 2-2.7 2-6 2-6-1-6-2Z"/><path d="M6 4v16c0 1 2.7 2 6 2s6-1 6-2V4"/><path d="M6 12c0 1 2.7 2 6 2s6-1 6-2"/></svg>'
const ICON_LEAF = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>'

// Fixed categorical order (validated for CVD + contrast, see dataviz skill palette.md).
// Color is assigned to the material identity, never to its rank in a given panel.
const MATERIAL_VISUALS = {
  Plastic:   { icon: ICON_BOTTLE, color: '#2a78d6' },
  Paper:     { icon: ICON_BOX,    color: '#eb6834' },
  Cardboard: { icon: ICON_BOX,    color: '#1baf7a' },
  Glass:     { icon: ICON_GLASS,  color: '#eda100' },
  Metal:     { icon: ICON_CAN,    color: '#e87ba4' },
}

function materialVisual(category) {
  return MATERIAL_VISUALS[category] || { icon: ICON_BOX, color: '#898781' }
}

function roundKg(value) {
  return Number(value || 0).toFixed(1)
}

function materialShare(collaborator, material) {
  if (!collaborator.totalKg) return 0
  return Math.min(100, Math.round((material.kg / collaborator.totalKg) * 100))
}

const availableYears = computed(() => {
  const years = new Set([new Date().getFullYear()])
  for (const c of collaborators) {
    for (const row of c.rawRows || []) years.add(row.year)
  }
  return [...years].sort((a, b) => b - a)
})

const periodLabel = computed(() => {
  return selectedMonth.value === 0
    ? `${selectedYear.value}`
    : `${MONTH_LABELS[selectedMonth.value - 1]} ${selectedYear.value}`
})

const viewModels = computed(() => {
  return collaborators.map((c) => {
    const periodRows = filterRowsByPeriod(c.rawRows, selectedYear.value, selectedMonth.value)
    const periodMaterials = buildMaterialSlices(periodRows).map((slice) => ({ ...slice, ...materialVisual(slice.category) }))

    return {
      ...c,
      yearlySeries: buildYearlySeries(c.rawRows, selectedYear.value),
      periodMaterialSlices: periodMaterials.map((m) => ({ category: m.category, kg: m.kg, color: m.color })),
      periodTotalKg: periodMaterials.reduce((sum, m) => sum + m.kg, 0),
    }
  })
})

// Ranked by the currently filtered period, not lifetime totals — the leaderboard
// order itself answers "who's recycling the most" for whatever window is selected.
const rankedViewModels = computed(() => {
  return [...viewModels.value].sort((a, b) => b.periodTotalKg - a.periodTotalKg)
})

async function loadCollaborators() {
  loading.value = true
  errorMessage.value = ''

  try {
    const client = getInsforgeClient()
    const [collaboratorsResult, totalsResult] = await Promise.all([
      client.database.from('collaborators').select('id, slug, name, logo_url').order('name', { ascending: true }),
      client.database.from('collaborator_material_totals').select('collaborator_id, year, month, material_category, quantity_kg'),
    ])

    if (collaboratorsResult.error) throw new Error(collaboratorsResult.error.message)
    if (totalsResult.error) throw new Error(totalsResult.error.message)

    const totalsByCollaborator = new Map()
    for (const row of totalsResult.data || []) {
      const list = totalsByCollaborator.get(row.collaborator_id) || []
      list.push(row)
      totalsByCollaborator.set(row.collaborator_id, list)
    }

    const rows = (collaboratorsResult.data || []).map((collaborator) => {
      const collaboratorRows = totalsByCollaborator.get(collaborator.id) || []

      const materials = buildMaterialSlices(collaboratorRows)
        .map((slice) => ({ ...slice, ...materialVisual(slice.category) }))

      return {
        ...collaborator,
        rawRows: collaboratorRows,
        materials,
        totalKg: materials.reduce((sum, material) => sum + material.kg, 0),
      }
    })

    collaborators.splice(0, collaborators.length, ...rows)

    if (!availableYears.value.includes(selectedYear.value)) {
      selectedYear.value = availableYears.value[0]
    }
  } catch (error) {
  console.error(error)
  errorMessage.value = 'We could not load collaborator data. Please try again later.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadCollaborators()

  if (highlightedSlug.value) {
    document.getElementById(`collaborator-${highlightedSlug.value}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');

.collab-page {
  min-height: 100vh;
  background: #0D2B0D;
  color: #F1EDE2;
  font-family: 'Inter', sans-serif;
  padding: 32px 20px 72px;
}

.collab-topbar {
  max-width: 1180px;
  margin: 0 auto 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.collab-wordmark {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.collab-wordmark span { color: #F2C94C; }
.collab-spacer { width: 34px; }

.collab-hero {
  max-width: 640px;
  margin: 0 auto 36px;
  text-align: center;
}
.eyebrow {
  margin: 0 0 12px;
  font-family: 'IBM Plex Mono', monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #F2C94C;
  font-size: 0.74rem;
}
.collab-hero h1 {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  line-height: 1.08;
  letter-spacing: -0.01em;
}
.subtitle {
  margin: 16px auto 0;
  color: #b9cdbb;
  line-height: 1.6;
}

.state-banner {
  max-width: 560px;
  margin: 0 auto;
  padding: 18px 20px;
  border-radius: 16px;
  text-align: center;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
}
.state-banner.error { border-color: rgba(232, 137, 106, 0.5); color: #ffcfc0; }

.collab-filters {
  max-width: 1180px;
  margin: 0 auto 24px;
  display: flex;
  gap: 22px;
  flex-wrap: wrap;
}
.collab-filters label {
  display: flex;
  align-items: center;
  gap: 9px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #F2C94C;
}
.collab-filters select {
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.16);
  color: #F1EDE2;
  padding: 8px 12px;
  border-radius: 100px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}
.collab-filters select:focus-visible {
  outline: none;
  border-color: #F2C94C;
  box-shadow: 0 0 0 2px rgba(242,201,76,0.3);
}
.collab-filters select option { color: #0b0b0b; }

.collab-list {
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.collab-panel {
  background: #123920;
  border: 1px solid rgba(241,237,226,0.1);
  border-radius: 28px;
  padding: clamp(22px, 3vw, 34px);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.collab-panel.leading {
  border-color: rgba(242,201,76,0.55);
  box-shadow: 0 24px 48px -28px rgba(242,201,76,0.35);
}
.collab-panel.highlighted {
  border-color: #F2C94C;
  box-shadow: 0 0 0 2px rgba(242,201,76,0.5);
}

.panel-hero {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  padding-bottom: clamp(20px, 3vw, 28px);
  margin-bottom: clamp(20px, 3vw, 28px);
  border-bottom: 1px solid rgba(241,237,226,0.1);
}

.rank-badge {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: #b9cdbb;
  width: 40px;
  flex-shrink: 0;
}
.collab-panel.leading .rank-badge { color: #F2C94C; }

.seal {
  position: relative;
  flex-shrink: 0;
}
.seal-img {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(241,237,226,0.18);
  box-shadow: 0 12px 26px -10px rgba(0,0,0,0.5);
}
.collab-panel.leading .seal-img { border-color: #F2C94C; }
.seal-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #F2C94C;
  color: #123920;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #123920;
}

.panel-identity { flex: 1; min-width: 160px; }
.panel-eyebrow {
  margin: 0 0 4px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.66rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #b9cdbb;
}
.panel-identity h2 {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2.1rem);
}

.panel-hero-stat { text-align: right; }
.hero-number {
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: clamp(2.2rem, 4vw, 3rem);
  line-height: 1;
  color: #F2C94C;
}
.hero-number span { font-size: 1rem; font-weight: 600; margin-left: 4px; color: #d8c98a; }
.hero-caption {
  margin: 6px 0 0;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #b9cdbb;
}

.panel-body {
  display: grid;
  grid-template-columns: minmax(220px, 0.85fr) 1px minmax(0, 1.7fr);
  gap: 28px;
  align-items: start;
}

.panel-divider { background: rgba(241,237,226,0.1); align-self: stretch; }

.panel-section-label {
  margin: 0 0 14px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #b9cdbb;
}

.material-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.material-list li {
  display: grid;
  grid-template-columns: 20px auto 1fr auto;
  align-items: center;
  gap: 10px;
}
.material-icon { color: var(--m-color); display: flex; }
.material-name { font-size: 0.82rem; font-weight: 600; color: #F1EDE2; white-space: nowrap; }
.material-bar {
  height: 6px;
  border-radius: 4px;
  background: rgba(241,237,226,0.1);
  overflow: hidden;
}
.material-bar-fill { display: block; height: 100%; border-radius: 4px; background: var(--m-color); }
.material-kg {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.76rem;
  color: #b9cdbb;
  white-space: nowrap;
}

.collab-empty { margin: 0; color: #b9cdbb; font-size: 0.85rem; }

.collab-stats-charts {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 16px;
  align-items: stretch;
}

.closing-phrase {
  max-width: 640px;
  margin: 48px auto 0;
  text-align: center;
  color: #b9cdbb;
  line-height: 1.6;
}
.closing-phrase span { color: #F2C94C; font-weight: 700; }

@media (max-width: 520px) {
  .collab-topbar { padding: 0 4px; }
  .panel-hero-stat { text-align: left; margin-left: 0; width: 100%; }
}

@media (max-width: 900px) {
  .collab-stats-charts { grid-template-columns: 1fr; }
  .panel-body { grid-template-columns: 1fr; }
  .panel-divider { width: 100%; height: 1px; }
}
</style>
