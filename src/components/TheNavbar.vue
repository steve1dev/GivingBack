<template>
  <header class="header">
    <nav class="nav-container">
      <div class="logo-container">
        <RouterLink to="/" class="logo-link">
          <img src="/assets/img/reciclar.png" alt="Logo Giving Back" class="logo-img" />
        </RouterLink>
      </div>

      <div class="menu-desktop">
        <RouterLink to="/camera" class="nav-link">Scan</RouterLink>
        <RouterLink to="/Giving-Map" class="nav-link">Giving Map</RouterLink>
        <RouterLink to="/Learn" class="nav-link">Learn</RouterLink>
        <a href="/#team" class="nav-link">About Us</a>
        <a href="/#collaborators" class="nav-link">Collaborators</a>
        

        
        
      </div>

      <div class="navbar-brand-mobile">Giving Back</div>

      <div class="auth-buttons">
        <template v-if="!auth.isLoggedIn">
          <RouterLink to="/login" class="btn-login">Log In</RouterLink>
          <RouterLink to="/login" class="btn-signup">Sign Up</RouterLink>
        </template>
        <template v-else>
          <RouterLink
            to="/Account"
            class="auth-avatar-link"
            :title="`My account: ${auth.username}`"
            aria-label="Ir a mi cuenta"
          >
            <span class="auth-avatar">
              <img
                v-if="userAvatarUrl"
                :src="userAvatarUrl"
                :alt="`Avatar de ${auth.username}`"
                class="auth-avatar__img"
              />
              <span v-else>{{ userInitials }}</span>
            </span>
          </RouterLink>
          <button class="btn-signup" @click="handleLogout">Log Out</button>
        </template>
      </div>

      <button class="mobile-menu-btn" :class="{ 'is-open': menuOpen }" type="button" :aria-expanded="menuOpen" aria-label="Toggle menu" @click="toggleMenu">
        <span class="hamburger-box">
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </span>
      </button>

      <div class="menu-extra" :class="{ active: menuOpen }">
        <RouterLink to="/Adquirir" @click="closeMenu">Acquire</RouterLink>
        <a href="#team" @click="closeMenu">About Us</a>
        <a href="#collaborators" @click="closeMenu">Collaborators</a>
        <RouterLink to="/Giving-Map" @click="closeMenu">Giving Map</RouterLink>
        <RouterLink to="/camera" @click="closeMenu">Donate</RouterLink>
        <RouterLink to="/Learn" @click="closeMenu">Learn</RouterLink>
        <div class="menu-extra-divider"></div>
        <template v-if="!auth.isLoggedIn">
          <RouterLink to="/login" @click="closeMenu">Log In</RouterLink>
          <RouterLink to="/login" @click="closeMenu">Sign Up</RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/Account" class="menu-extra-account" @click="closeMenu">
            <span class="auth-avatar">
              <img
                v-if="userAvatarUrl"
                :src="userAvatarUrl"
                :alt="`Avatar de ${auth.username}`"
                class="auth-avatar__img"
              />
              <span v-else>{{ userInitials }}</span>
            </span>
            <span>My account</span>
          </RouterLink>
          <button type="button" class="menu-extra-logout" @click="handleLogout">Log Out</button>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { getInsforgeClient, resolveAvatarUrl, useAuthStore } from '../stores/auth.js'

const auth    = useAuthStore()
const router  = useRouter()
const menuOpen = ref(false)
const resolvedAvatarUrl = ref(auth.user?.avatarUrl || '')

const userInitials = computed(() => {
  const parts = String(auth.username || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
})

const userAvatarUrl = computed(() => resolvedAvatarUrl.value || auth.user?.avatarUrl || '')

async function resolveAvatarFromCurrentUser() {
  if (!auth.isLoggedIn) {
    resolvedAvatarUrl.value = ''
    return
  }

  if (auth.user?.avatarUrl) {
    resolvedAvatarUrl.value = auth.user.avatarUrl
    return
  }

  try {
    const client = getInsforgeClient()
    const { data, error } = await client.auth.getCurrentUser()
    if (error || !data?.user) return

    let photo = resolveAvatarUrl(data.user) || ''

    if (!photo) {
      try {
        const profileResponse = await client.auth.getProfile(data.user.id)
        if (!profileResponse?.error) {
          photo = resolveAvatarUrl(profileResponse?.data || null) || photo
        }
      } catch {
        // Ignore profile lookup failures and keep the auth payload avatar if any.
      }
    }

    if (photo) {
      resolvedAvatarUrl.value = photo
    }
  } catch (error) {
    console.error(error)
  }
}

watch(() => auth.user?.avatarUrl, (value) => {
  if (value) resolvedAvatarUrl.value = value
})

watch(() => auth.isLoggedIn, () => {
  resolveAvatarFromCurrentUser()
})

onMounted(() => {
  resolveAvatarFromCurrentUser()
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function handleAvatarError() {
  resolvedAvatarUrl.value = ''
}

function handleLogout() {
  auth.logout()
  closeMenu()
  router.push('/')
}
</script>
