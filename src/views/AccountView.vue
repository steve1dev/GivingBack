<template>
  <TheNavbar></TheNavbar>
  <GivingChat></GivingChat>

  <div class="page">

    <div v-if="rewardMessage" class="reward-banner" role="status" aria-live="polite">
      <strong>¡Points Added!</strong>
      <span>{{ rewardMessage }}</span>
    </div>

    <div class="topbar">
      <BackButton theme="onDark" fallback="/" label="Back" />
      <div class="wordmark">Pro<span>file</span></div>
      <div class="recycle-badge" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>
      </div>
    </div>

    <div class="cover"></div>
    <div class="card">
      <div class="identity">
        <div class="avatar">
          <img v-if="user.photoUrl" :src="user.photoUrl" alt="Foto de perfil" class="avatar-img" @error="user.photoUrl = ''" />
          <span v-else class="avatar-initials">{{ user.initials }}</span>
        </div>
        <div class="id-text">
          <p class="id-name">{{ user.name }}</p>
          <p class="id-tag">Member since {{ user.memberSince }} <span class="stamp-chip">Level {{ user.level }}</span></p>
        </div>
      </div>

      <div class="contact-row">
        <div class="contact-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span><b>{{ user.phone }}</b></span>
        </div>
        <div class="contact-item">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 6l-10 7L2 6"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
          <span><b>{{ user.email }}</b></span>
        </div>
      </div>

      <div class="points-float">
        <span class="points-badge-float">Level {{ user.level }}</span>
        <p class="points-label">Giving Points</p>
        <p class="points-value">{{ user.points.toLocaleString('es-SV') }} <span>pts</span></p>
        <div class="points-progress-track">
          <div class="points-progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="points-foot">
          <span>{{ user.level }}</span>
          <span><b>{{ user.nextLevelPoints }} pts</b> remaining to reach {{ user.nextLevel }}</span>
        </div>
        <div class="points-leaf">
          <img src="/assets/img/givingPoint.png" alt="Giving Point" class="points-leaf-icon" />
        </div>
      </div>

      <p class="section-label">Recent Activity</p>
      <div class="streak-strip">
        <div class="streak-info">
          <span class="streak-flame" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
          </span>
          <div>
        <b>{{ user.streakDays }} days in a row</b>
        <small>{{ user.streakMessage }}</small>
      </div>
        </div>
        <div class="streak-days">
          <div
            v-for="(day, i) in week"
            :key="i"
            class="streak-day"
            :class="day.active ? 'on' : 'off'"
          >{{ day.label }}</div>
        </div>
      </div>

      <p class="section-label">Recycle materials</p>
      <div class="stamps-grid">
        <div
          v-for="(material, i) in materials"
          :key="i"
          class="material-stamp"
          :style="{ '--m-color': material.color, '--m-dark': material.colorDark }"
        >
          <div class="material-icon" v-html="material.icon"></div>
          <p class="material-kg">{{ material.kg }}<span> kg</span></p>
          <p class="material-name">{{ material.name }}</p>
        </div>
      </div>

      <p class="closing-phrase">
        <span class="closing-icon" aria-hidden="true"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg></span>
        Every <span>recycle material</span> is one more step toward a better planet.
      </p>

    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import TheNavbar from '../components/TheNavbar.vue'
import GivingChat from '../components/GivingChat.vue'
import BackButton from '../components/BackButton.vue'
import { getInsforgeClient, resolveAvatarUrl, useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const route = useRoute()

const rewardMessage = computed(() => {
  const reward = route.query.reward
  if (typeof reward === 'string' && reward.trim()) {
    return reward
  }
  return ''
})

const user = reactive({
  name: auth.username || 'Usuario',
  initials: 'U',
  phone: 'Not available',
  email: auth.user?.email || 'Not available',
  memberSince: 'this month',
  level: 'Eco Seed',
  nextLevel: 'Eco+',
  points: 0,
  nextLevelPoints: 500,
  streakDays: 0,
  photoUrl: '',
  streakMessage: 'Recycle today to keep the streak going.',
  recycledToday: false,
})

const ICON_BOTTLE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 2h6v3.2c0 .5.2.9.5 1.3l1 1.2c.6.7 1 1.6 1 2.6V19a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3V10.3c0-1 .4-1.9 1-2.6l1-1.2c.3-.4.5-.8.5-1.3V2Z"/><path d="M9 2h6"/><path d="M8.5 11h7"/></svg>'
const ICON_BOX = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5 12 4l9 4.5"/><path d="M3 8.5v9L12 22l9-4.5v-9"/><path d="M3 8.5 12 13l9-4.5"/><path d="M12 13v9"/></svg>'
const ICON_CAN = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4c0-1 2.7-2 6-2s6 1 6 2-2.7 2-6 2-6-1-6-2Z"/><path d="M6 4v16c0 1 2.7 2 6 2s6-1 6-2V4"/><path d="M6 12c0 1 2.7 2 6 2s6-1 6-2"/></svg>'

// Nota: se corrige el color de cada material para que use el token semantico
// correcto (antes "Plastic" tomaba el color de --vidrio y "Cans" el de --coral,
// dejando --plastico/--papel/--metal sin uso pese a estar definidos para esto).
const materials = reactive([
  { name: 'Plastic', icon: ICON_BOTTLE, kg: 0, color: 'var(--plastico)', colorDark: 'var(--plastico-dark)' },
  { name: 'Paper & Cardboard', icon: ICON_BOX, kg: 0, color: 'var(--papel)', colorDark: 'var(--papel-dark)' },
  { name: 'Cans', icon: ICON_CAN, kg: 0, color: 'var(--metal)', colorDark: 'var(--metal-dark)' },
])

const week = reactive([
  { label: 'M', active: false },
  { label: 'T', active: false },
  { label: 'W', active: false },
  { label: 'T', active: false },
  { label: 'F', active: false },
  { label: 'S', active: false },
  { label: 'M', active: false },
])

const LEVELS = [
  { name: 'Eco Seed', min: 0, next: 'Eco+', nextAt: 500 },
  { name: 'Eco+', min: 500, next: 'Eco Pro', nextAt: 1200 },
  { name: 'Eco Pro', min: 1200, next: 'Eco Max', nextAt: 2500 },
  { name: 'Eco Max', min: 2500, next: 'Eco Legend', nextAt: 5000 },
  { name: 'Eco Legend', min: 5000, next: 'Eco Legend', nextAt: 5000 },
]

function buildAvatarFallback(seed) {
  const safeSeed = encodeURIComponent(seed || 'Usuario')
  return `https://api.dicebear.com/9.x/initials/svg?seed=${safeSeed}&backgroundType=gradientLinear`
}

function buildInitials(seed) {
  const parts = String(seed || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function formatMemberSince(dateValue) {
  if (!dateValue) return 'this month'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'this month'
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toLowerCase()
}

function resolveLevel(points) {
  let current = LEVELS[0]

  for (const level of LEVELS) {
    if (points >= level.min) {
      current = level
    }
  }

  return {
    level: current.name,
    nextLevel: current.next,
    nextLevelPoints: Math.max(current.nextAt - points, 0),
  }
}

function applyWeeklyActivity(events) {
  week.forEach((day) => {
    day.active = false
  })

  const activeIndexes = new Set()
  for (const event of events || []) {
    const recycledAt = event?.recycled_at || event?.created_at || event?.date || event?.timestamp
    const date = new Date(recycledAt)
    if (Number.isNaN(date.getTime())) continue
    const jsDay = date.getDay()
    const mondayBasedIndex = jsDay === 0 ? 6 : jsDay - 1
    activeIndexes.add(mondayBasedIndex)
  }

  week.forEach((day, index) => {
    day.active = activeIndexes.has(index)
  })
}

function estimateKgForMaterial(materialCategory, quantity) {
  const normalizedQuantity = Number(quantity || 0)
  const baseWeights = {
    Plastic: 0.4,
    Paper: 0.6,
    Cardboard: 0.7,
    Glass: 0.8,
    Metal: 0.9,
  }

  return normalizedQuantity * (baseWeights[materialCategory] || 0.5)
}

function roundKg(value) {
  return Number(value || 0).toFixed(1)
}

function normalizeEvents(events) {
  return (events || [])
    .map((event) => ({
      ...event,
      recycled_at: event?.recycled_at || event?.created_at || event?.date || event?.timestamp || new Date().toISOString(),
      material_category: event?.material_category || event?.category || event?.name || event?.material || 'Plastic',
      quantity: Number(event?.quantity || event?.amount || event?.count || event?.item_count || 1),
      points_earned: Number(event?.points_earned || event?.points || 0),
    }))
    .sort((left, right) => new Date(right.recycled_at) - new Date(left.recycled_at))
}

function calculateStreakFromEvents(events) {
  const uniqueDays = [...new Set((events || [])
    .filter((event) => event?.recycled_at || event?.created_at || event?.date || event?.timestamp)
    .map((event) => {
      const recycledAt = event?.recycled_at || event?.created_at || event?.date || event?.timestamp
      return new Date(recycledAt).toISOString().slice(0, 10)
    }))]

  if (uniqueDays.length === 0) return 0

  const sortedDays = uniqueDays.sort()
  let currentStreak = 1

  for (let index = sortedDays.length - 1; index > 0; index -= 1) {
    const previousDate = new Date(sortedDays[index - 1])
    const currentDate = new Date(sortedDays[index])
    const dayDifference = (currentDate - previousDate) / (1000 * 60 * 60 * 24)

    if (dayDifference === 1) {
      currentStreak += 1
    } else {
      break
    }
  }

  return currentStreak
}

function buildStreakMessage(events) {
  const today = new Date().toISOString().slice(0, 10)
  const hasToday = (events || []).some((event) => {
    const recycledAt = event?.recycled_at || event?.created_at || event?.date || event?.timestamp
    return recycledAt && new Date(recycledAt).toISOString().slice(0, 10) === today
  })

  if (hasToday) {
    return 'You\'re on a roll today!'
  }

  return 'Recycle today to keep the streak going.'
}

async function loadAccountData() {
  if (!auth.isLoggedIn) return

  const persistedPoints = Number(localStorage.getItem('givingPoints')) || 0
  if (persistedPoints > 0 || user.points > 0) {
    user.points = Math.max(user.points, persistedPoints)
  }

  const client = getInsforgeClient()
  const { data: currentUserPayload, error: currentUserError } = await client.auth.getCurrentUser()
  if (currentUserError || !currentUserPayload?.user) return

  const currentUser = currentUserPayload.user
  const baseName = currentUser.profile?.name || auth.username || currentUser.email?.split('@')[0] || 'Usuario'
  let oauthAvatarUrl = resolveAvatarUrl(currentUser) || ''

  try {
    const profileResponse = await client.auth.getProfile(currentUser.id)
    if (!profileResponse?.error) {
      oauthAvatarUrl = resolveAvatarUrl(profileResponse?.data || null) || oauthAvatarUrl
    }
  } catch {
    // Ignore profile lookup failures and keep the auth payload avatar if any.
  }

  user.name = baseName
  user.email = currentUser.email || 'Not available'
  user.initials = buildInitials(baseName)
  user.photoUrl = oauthAvatarUrl || buildAvatarFallback(baseName)

  const [profileResult, walletResult, streakResult, totalsResult, eventsResult] = await Promise.allSettled([
    client.database.from('account_profiles').select('display_name, phone, avatar_url, member_since').maybeSingle(),
    client.database.from('user_points_wallet').select('total_points').maybeSingle(),
    client.database.from('user_recycling_streak').select('current_streak_days, last_recycle_date').maybeSingle(),
    client.database.from('user_material_totals').select('material_category, item_count').limit(50),
    client.database
      .from('recycling_events')
      .select('material_category, quantity, recycled_at')
      .order('recycled_at', { ascending: false }),
  ])

  const profileResultValue = profileResult.status === 'fulfilled' ? profileResult.value : null
  const walletResultValue = walletResult.status === 'fulfilled' ? walletResult.value : null
  const streakResultValue = streakResult.status === 'fulfilled' ? streakResult.value : null
  const totalsResultValue = totalsResult.status === 'fulfilled' ? totalsResult.value : null
  const eventsResultValue = eventsResult.status === 'fulfilled' ? eventsResult.value : null

  const profile = profileResultValue?.data || null
  const wallet = walletResultValue?.data || null
  const streak = streakResultValue?.data || null
  const totals = totalsResultValue?.data || []
  const serverEvents = eventsResultValue?.data || []
  const localEvents = JSON.parse(localStorage.getItem('giving_recycling_history') || '[]')
  const events = normalizeEvents([...serverEvents, ...localEvents])

  if (profile?.display_name) {
    user.name = profile.display_name
  }

  user.phone = profile?.phone || 'Not available'
  user.photoUrl = oauthAvatarUrl || profile?.avatar_url || buildAvatarFallback(user.name)
  user.memberSince = formatMemberSince(profile?.member_since || currentUser.createdAt || currentUser.created_at)

  const walletPoints = walletResultValue?.error
    ? persistedPoints
    : Number(wallet?.total_points ?? persistedPoints)

  const nextPoints = Number.isFinite(walletPoints) && walletPoints >= Math.max(user.points, persistedPoints)
    ? walletPoints
    : Math.max(user.points, persistedPoints)

  user.points = nextPoints
  localStorage.setItem('givingPoints', String(user.points))

  const derivedStreak = Number(streak?.current_streak_days || 0)
  user.streakDays = derivedStreak > 0 ? derivedStreak : calculateStreakFromEvents(events)
  user.recycledToday = (events || []).some((event) => event?.recycled_at && new Date(event.recycled_at).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10))
  user.streakMessage = buildStreakMessage(events)

  const levelState = resolveLevel(user.points)
  user.level = levelState.level
  user.nextLevel = levelState.nextLevel
  user.nextLevelPoints = levelState.nextLevelPoints

  const byCategory = (events || []).reduce((acc, row) => {
    const key = row?.material_category || row?.category || row?.name || row?.material
    if (!key) return acc
    acc[key] = (acc[key] || 0) + estimateKgForMaterial(key, row?.quantity || row?.amount || row?.count || 1)
    return acc
  }, {})

  const fallbackByCategory = (totals || []).reduce((acc, row) => {
    const key = row?.material_category || row?.category || row?.name || row?.material
    if (!key) return acc
    acc[key] = (acc[key] || 0) + Number(row?.item_count || row?.count || row?.quantity || 0)
    return acc
  }, {})

  const finalByCategory = Object.keys(fallbackByCategory).length > 0 && Object.keys(byCategory).length === 0
    ? Object.fromEntries(Object.entries(fallbackByCategory).map(([key, value]) => [key, estimateKgForMaterial(key, value)]))
    : byCategory

  materials[0].kg = roundKg(finalByCategory.Plastic || 0)
  materials[1].kg = roundKg((finalByCategory.Paper || 0) + (finalByCategory.Cardboard || 0))
  materials[2].kg = roundKg((finalByCategory.Metal || 0) + (finalByCategory.Glass || 0))

  applyWeeklyActivity(events)
}

// simple example: based on points toward next level, capped at 100
const progressPercent = computed(() => {
  const total = user.points + user.nextLevelPoints
  if (!total) return 0
  return Math.round((user.points / total) * 100)
})

function refreshAccountDataIfNeeded() {
  if (auth.isLoggedIn && route.path === '/Account') {
    loadAccountData()
  }
}

watch(
  () => auth.isLoggedIn,
  (isLoggedIn) => {
    if (isLoggedIn) {
      loadAccountData()
    }
  },
  { immediate: true }
)

watch(
  () => auth.user?.avatarUrl,
  () => {
    if (auth.isLoggedIn) {
      loadAccountData()
    }
  }
)

watch(
  () => route.fullPath,
  () => {
    if (route.path === '/Account') {
      refreshAccountDataIfNeeded()
    }
  },
  { immediate: true }
)

onMounted(() => {
  refreshAccountDataIfNeeded()

  window.addEventListener('focus', refreshAccountDataIfNeeded)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      refreshAccountDataIfNeeded()
    }
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', refreshAccountDataIfNeeded)
  document.removeEventListener('visibilitychange', refreshAccountDataIfNeeded)
})

</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');

:root{
  --ink: #0D2B0D;
  --ink-soft: #123920;
  --paper: #F1EDE2;
  --paper-line: #DCD5C2;
  --page-cream: #EAE2CE;
  --lime: #F2C94C;
  --lime-dark: #7A4E0A;
  --plastico: #4F86C6;
  --plastico-dark: #1F3E63;
  --papel: #C98A3E;
  --papel-dark: #6B450F;
  --vidrio: #3FA796;
  --vidrio-dark: #1B4A41;
  --metal: #8B8F87;
  --metal-dark: #40433D;
  --coral: #E8896A;
  --coral-dark: #8A3F27;
  --text-soft: #5B6459;
}
*{box-sizing:border-box;}
body{
  margin:0;
  background: var(--ink);
  font-family:'Inter',sans-serif;
  color: var(--ink);
}
.page{
  width:100%;
  max-width:940px;
  margin:0 auto;
  padding: 32px 24px 64px;
}
.reward-banner {
  display:flex;
  flex-direction:column;
  gap:6px;
  margin:0 0 18px;
  padding:14px 16px;
  border-radius:16px;
  background: linear-gradient(135deg, rgba(96, 214, 133, 0.22), rgba(30, 94, 53, 0.32));
  border:1px solid rgba(143, 239, 170, 0.28);
  color: var(--paper);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.16);
}

.reward-banner strong {
  font-size: 0.96rem;
}

.topbar{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 4px 20px;
}
.wordmark{
  font-family:'Space Grotesk',sans-serif;
  font-weight:700;
  font-size:18px;
  letter-spacing:0.06em;
  color: var(--paper);
  text-transform:uppercase;
}
.wordmark span{color:var(--lime);}
.recycle-badge{
  width:36px;height:36px;
  border-radius:50%;
  background: var(--paper);
  display:flex;align-items:center;justify-content:center;
  font-size:18px;
  box-shadow: 0 4px 12px rgba(30,74,46,0.15);
}

.cover{
  height:150px;
  border-radius:16px 16px 0 0;
  background: var(--ink-soft);
  position:relative;
  overflow:hidden;
}

.card{
  background:var(--paper);
  border-radius:0 0 16px 16px;
  padding: 0 28px 28px;
  position:relative;
}

.identity{
  display:flex;
  align-items:flex-end;
  gap:18px;
  padding-top:0;
  margin-top:-46px;
}
.avatar{
  width:104px;height:104px;
  border-radius:50%;
  background: var(--page-cream);
  border:5px solid var(--paper);
  display:flex;align-items:center;justify-content:center;
  flex-shrink:0;
  position:relative;
  overflow:hidden;
  box-shadow: 0 0 0 1px rgba(30,74,46,0.1), 0 10px 20px -8px rgba(30,74,46,0.35);
}
.avatar span{
  font-family:'Space Grotesk',sans-serif;
  font-weight:700;
  font-size:36px;
  letter-spacing:0.02em;
  color:var(--ink);
}
.avatar-img{
  width:100%;
  height:100%;
  object-fit:cover;
}
.id-text{padding-bottom:8px;}
.id-name{
  font-family:'Space Grotesk',sans-serif;
  font-weight:700;
  font-size:23px;
  margin:0;
  color:var(--ink);
}
.id-tag{
  margin:4px 0 0;
  font-size:13px;
  color:var(--text-soft);
  display:flex;
  align-items:center;
  gap:8px;
}
.id-tag .stamp-chip{
  font-family:'IBM Plex Mono',monospace;
  font-size:11px;
  letter-spacing:0.03em;
  border:1px solid var(--lime-dark);
  color:var(--lime-dark);
  padding:2px 8px;
  border-radius:100px;
}

.contact-row{
  display:flex;
  gap:24px;
  flex-wrap:wrap;
  margin-top:22px;
  padding-top:18px;
  border-top:1px dashed var(--paper-line);
  font-size:13.5px;
}
.contact-item{display:flex; align-items:center; gap:8px; color:var(--ink-soft);}
.contact-item svg{flex-shrink:0; opacity:0.7;}
.contact-item b{font-weight:600;}

.points-float{
  position:relative;
  margin:40px 4px 34px;
  background: var(--ink);
  border-radius:24px;
  padding:28px 26px 24px;
  box-shadow: 0 30px 44px -20px rgba(30,74,46,0.5), 0 6px 14px -4px rgba(30,74,46,0.25);
  transition: transform 0.35s cubic-bezier(.2,.8,.2,1), box-shadow 0.35s ease;
  cursor:pointer;
}
.points-float:hover{
  transform: translateY(-6px) scale(1.015);
  box-shadow: 0 44px 64px -20px rgba(30,74,46,0.6), 0 10px 22px -6px rgba(30,74,46,0.35);
}
.points-float::after{
  content:"";
  position:absolute;
  inset:0;
  border-radius:24px;
  border:2px solid var(--lime);
  opacity:0;
  pointer-events:none;
  transition: opacity 0.3s ease;
}
.points-float:hover::after{
  opacity:1;
  animation: points-pulse 1.4s ease-out infinite;
}
@keyframes points-pulse{
  0%{ box-shadow:0 0 0 0 rgba(242,201,76,0.35); }
  100%{ box-shadow:0 0 0 12px rgba(242,201,76,0); }
}
.points-badge-float{
  position:absolute;
  top:-15px;
  right:26px;
  background:var(--lime);
  color:var(--lime-dark);
  font-family:'IBM Plex Mono',monospace;
  font-size:11px;
  font-weight:500;
  letter-spacing:0.03em;
  padding:6px 14px;
  border-radius:100px;
  box-shadow:0 10px 18px -8px rgba(30,74,46,0.5);
  transition: transform 0.35s ease;
}
.points-float:hover .points-badge-float{
  transform: translateY(-4px) rotate(-3deg);
}
.points-label{
  font-family:'IBM Plex Mono',monospace;
  font-size:11px;
  letter-spacing:0.14em;
  text-transform:uppercase;
  color:rgba(241,237,226,0.5);
  margin:0 0 6px;
}
.points-value{
  font-family:'Space Grotesk',sans-serif;
  font-weight:700;
  font-size:46px;
  color:var(--paper);
  margin:0;
  line-height:1;
  letter-spacing:-0.01em;
}
.points-value span{font-size:16px; color:var(--lime); font-family:'Inter',sans-serif; font-weight:600; margin-left:8px;}
.points-progress-track{
  margin-top:20px;
  height:6px;
  border-radius:100px;
  background:rgba(241,237,226,0.14);
  overflow:hidden;
}
.points-progress-fill{
  height:100%;
  border-radius:100px;
  background:var(--lime);
  transition: width 0.6s ease;
}
.points-foot{
  display:flex;
  justify-content:space-between;
  margin-top:10px;
  font-size:11.5px;
  color:rgba(241,237,226,0.5);
}
.points-foot b{color:var(--lime); font-weight:600;}
.points-leaf{
  position:absolute;
  bottom:-16px;
  left:26px;
  width:38px;height:38px;
  border-radius:50%;
  background:var(--paper);
  border:3px solid var(--ink);
  display:flex;align-items:center;justify-content:center;
  font-size:15px;
  box-shadow:0 10px 18px -6px rgba(30,74,46,0.4);
  transition: transform 0.35s ease;
  overflow:hidden;
}
.points-leaf-icon{ width:26px; height:26px; object-fit:contain; }
.points-float:hover .points-leaf{
  transform: rotate(-14deg) scale(1.12);
}

.section-label{
  font-family:'IBM Plex Mono',monospace;
  font-size:11px;
  letter-spacing:0.1em;
  text-transform:uppercase;
  color:var(--text-soft);
  margin:30px 0 14px;
}

.stamps-grid{
  display:grid;
  grid-template-columns:repeat(3, 1fr);
  gap:14px;
}
.material-stamp{
  border:2px solid var(--m-color);
  border-radius:12px;
  padding:14px 8px 12px;
  text-align:center;
  position:relative;
  background:rgba(255,255,255,0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
  cursor:pointer;
}
.material-stamp:hover{
  transform: rotate(0deg) translateY(-5px) scale(1.04);
  background:rgba(255,255,255,0.75);
  box-shadow: 0 14px 22px -12px var(--m-color);
  z-index:1;
}
.material-stamp:hover .material-icon{
  animation: material-bounce 0.5s ease;
}
@keyframes material-bounce{
  0%,100%{ transform: translateY(0); }
  40%{ transform: translateY(-6px) scale(1.15); }
}
.material-stamp:nth-child(1){transform:rotate(-2deg);}
.material-stamp:nth-child(2){transform:rotate(1.5deg);}
.material-stamp:nth-child(3){transform:rotate(-1deg);}
.material-icon{font-size:20px; margin-bottom:6px;}
.material-kg{
  font-family:'Space Grotesk',sans-serif;
  font-weight:700;
  font-size:19px;
  color:var(--m-dark);
  margin:0;
}
.material-kg span{font-size:11px; font-weight:500; font-family:'Inter',sans-serif;}
.material-name{
  font-size:11px;
  color:var(--m-dark);
  margin:2px 0 0;
  text-transform:uppercase;
  letter-spacing:0.04em;
  font-weight:600;
}

.streak-strip{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  background:rgba(242,201,76,0.12);
  border:1px solid rgba(122,78,10,0.25);
  border-radius:12px;
  padding:12px 16px;
  margin-bottom:16px;
  transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
  cursor:pointer;
}
.streak-strip:hover{
  transform: translateY(-3px);
  background:rgba(242,201,76,0.2);
  box-shadow: 0 12px 20px -10px rgba(122,78,10,0.35);
}
.streak-strip:hover .streak-info span{
  display:inline-block;
  animation: flame-flicker 0.6s ease-in-out infinite alternate;
}
@keyframes flame-flicker{
  from{ transform: scale(1) rotate(-3deg); }
  to{ transform: scale(1.15) rotate(3deg); }
}
.streak-day{
  transition: transform 0.25s ease;
  width:22px;height:22px;
  border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:9px;
  font-weight:600;
  font-family:'IBM Plex Mono',monospace;
}
.streak-strip:hover .streak-day.on{
  animation: streak-pop 0.4s ease forwards;
}
.streak-strip:hover .streak-day.on:nth-child(1){animation-delay:0.02s;}
.streak-strip:hover .streak-day.on:nth-child(2){animation-delay:0.06s;}
.streak-strip:hover .streak-day.on:nth-child(3){animation-delay:0.1s;}
.streak-strip:hover .streak-day.on:nth-child(4){animation-delay:0.14s;}
.streak-strip:hover .streak-day.on:nth-child(5){animation-delay:0.18s;}
.streak-strip:hover .streak-day.on:nth-child(6){animation-delay:0.22s;}
@keyframes streak-pop{
  0%{ transform:scale(1); }
  50%{ transform:scale(1.25); }
  100%{ transform:scale(1); }
}
.streak-info{display:flex; align-items:center; gap:10px;}
.streak-info b{
  font-family:'Space Grotesk',sans-serif;
  font-size:16px;
  color:var(--lime-dark);
}
.streak-info small{display:block; font-size:11px; color:var(--text-soft);}
.streak-days{display:flex; gap:6px;}
.streak-day.on{background:var(--lime-dark); color:var(--lime);}
.streak-day.off{background:transparent; border:1px dashed var(--paper-line); color:var(--text-soft);}

.closing-phrase{
  margin:26px 4px 6px;
  text-align:center;
  font-family:'Space Grotesk',sans-serif;
  font-size:14px;
  line-height:1.5;
  color:var(--text-soft);
  font-weight:500;
}
.closing-phrase span{color:var(--lime-dark); font-weight:700;}

@media (max-width:520px){
  .stamps-grid{grid-template-columns:repeat(2,1fr);}
  .contact-row{gap:14px;}
}
@media (max-width:380px){
  .avatar{width:80px;height:80px;}
  .id-name{font-size:19px;}
  .points-value{font-size:36px;}
  .identity{gap:14px;}
}
</style>