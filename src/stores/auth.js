import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createClient } from '@insforge/sdk'

const INSFORGE_URL = import.meta.env.VITE_INSFORGE_URL
const INSFORGE_ANON_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY
const USERNAME_MAP_KEY = 'gb_username_map'

function getAppUrl() {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_APP_URL || 'http://localhost:5173'
  }

  const currentOrigin = window.location.origin
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(currentOrigin)) {
    return currentOrigin
  }

  return import.meta.env.VITE_APP_URL || currentOrigin
}

const APP_URL = getAppUrl()

let insforge = null

export function getInsforgeClient() {
  if (insforge) return insforge

  insforge = createClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_ANON_KEY,
  })

  return insforge
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase()
}

function loadUsernameMap() {
  try {
    return JSON.parse(localStorage.getItem(USERNAME_MAP_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveUsernameMap(map) {
  localStorage.setItem(USERNAME_MAP_KEY, JSON.stringify(map))
}

function rememberUsername(username, email) {
  const normalized = normalizeUsername(username)
  if (!normalized || !email) return

  const map = loadUsernameMap()
  map[normalized] = email.toLowerCase()
  saveUsernameMap(map)
}

function resolveLoginEmail(usernameOrEmail) {
  const trimmed = String(usernameOrEmail || '').trim()
  if (isValidEmail(trimmed)) return trimmed.toLowerCase()

  const map = loadUsernameMap()
  return map[normalizeUsername(trimmed)] || null
}

function mapProvider(userData) {
  const providers = userData?.providers || []
  if (providers.includes('google')) return 'Google'
  if (providers.includes('github')) return 'GitHub'
  return 'local'
}

function mapUsername(userData) {
  const fromProfile = userData?.profile?.name
  if (fromProfile) return fromProfile
  if (userData?.email) return userData.email.split('@')[0]
  return 'usuario'
}

export function resolveAvatarUrl(userData) {
  const visited = new Set()
  const avatarKeys = ['avatar_url', 'avatarUrl', 'picture', 'avatar', 'image', 'image_url', 'profilePictureUrl', 'photoUrl', 'photo_url']

  function walk(value) {
    if (!value || typeof value !== 'object') return null
    if (visited.has(value)) return null
    visited.add(value)

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = walk(item)
        if (found) return found
      }
      return null
    }

    for (const [key, child] of Object.entries(value)) {
      if (typeof child === 'string' && avatarKeys.includes(key) && child.trim()) {
        return child.trim()
      }

      if (key === 'identity_data' || key === 'profile' || key === 'user_metadata' || key === 'app_metadata' || key === 'identities' || key === 'metadata' || key === 'oauth' || key === 'providers') {
        const found = walk(child)
        if (found) return found
      }
    }

    for (const [key, child] of Object.entries(value)) {
      if (key === 'id' || key === 'email' || key === 'createdAt' || key === 'updatedAt' || key === 'providers') {
        continue
      }

      const found = walk(child)
      if (found) return found
    }

    return null
  }

  return walk(userData)
}

function mapAvatarUrl(userData) {
  return resolveAvatarUrl(userData)
}

function mapSessionUser(userData) {
  if (!userData) return null

  return {
    id: userData.id,
    username: mapUsername(userData),
    email: userData.email,
    provider: mapProvider(userData),
    avatarUrl: mapAvatarUrl(userData),
    createdAt: userData.createdAt || userData.created_at || null,
  }
}

// ─── Auth Store ───────────────────────────────────────────────────────────
export const useAuthStore = defineStore('auth', () => {
  // State
  const user       = ref(JSON.parse(sessionStorage.getItem('gb_session') || 'null'))
  const loading    = ref(false)
  const error      = ref(null)
  const success    = ref(null)

  // Getters
  const isLoggedIn = computed(() => !!user.value)
  const username   = computed(() => user.value?.username || '')

  // ── Helpers ──
  function setSession(u) {
    user.value = u
    sessionStorage.setItem('gb_session', JSON.stringify(u))
  }

  function clearMessages() {
    error.value   = null
    success.value = null
  }

  function clearSession() {
    user.value = null
    sessionStorage.removeItem('gb_session')
  }

  function ensureInsforgeConfig() {
    if (INSFORGE_URL && INSFORGE_ANON_KEY) return true
    error.value = 'Falta configurar VITE_INSFORGE_URL o VITE_INSFORGE_ANON_KEY en .env.'
    return false
  }

  async function syncCurrentUser() {
    const client = getInsforgeClient()
    const { data, error: currentUserError } = await client.auth.getCurrentUser()
    if (currentUserError) throw new Error(currentUserError.message || 'No se pudo leer la sesión actual.')
    if (!data?.user) return null

    let avatarUrl = mapAvatarUrl(data.user)

    try {
      const profileResponse = await client.auth.getProfile(data.user.id)
      if (!profileResponse?.error) {
        const profileAvatar = resolveAvatarUrl(profileResponse?.data || null)
        if (profileAvatar) avatarUrl = profileAvatar
      }
    } catch {
      // Ignore profile lookup errors and keep the avatar from the auth payload if present.
    }

    const sessionUser = mapSessionUser(data.user)
    sessionUser.avatarUrl = avatarUrl
    setSession(sessionUser)
    rememberUsername(sessionUser.username, sessionUser.email)
    return sessionUser
  }

  // ── REGISTER ──
  async function register(username, email, password) {
    clearMessages()
    loading.value = true
    try {
      if (!ensureInsforgeConfig()) return false

      const cleanUsername = String(username || '').trim()
      const cleanEmail = String(email || '').trim().toLowerCase()

      if (cleanUsername.length < 3) throw new Error('El usuario debe tener al menos 3 caracteres.')
      if (!isValidEmail(cleanEmail)) throw new Error('Correo inválido.')
      if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.')

      const existingMap = loadUsernameMap()
      const existingEmail = existingMap[normalizeUsername(cleanUsername)]
      if (existingEmail && existingEmail !== cleanEmail) {
        throw new Error('Ese nombre de usuario ya está asociado a otra cuenta.')
      }

      const client = getInsforgeClient()
      const { error: signUpError } = await client.auth.signUp({
        email: cleanEmail,
        password,
        name: cleanUsername,
        redirectTo: `${APP_URL}/login`,
      })

      if (signUpError) throw new Error(signUpError.message || 'No se pudo completar el registro.')

      rememberUsername(cleanUsername, cleanEmail)
      success.value = '¡Cuenta creada! Ya puedes iniciar sesión.'
      return true
    } catch (e) {
      error.value = e?.message || 'Ocurrió un error al registrarte.'
      return false
    } finally {
      loading.value = false
    }
  }

  // ── LOGIN ──
  async function login(username, password) {
    clearMessages()
    loading.value = true
    try {
      if (!ensureInsforgeConfig()) return false

      const email = resolveLoginEmail(username)
      if (!email) {
        throw new Error('Para iniciar con usuario primero debes registrarte en este dispositivo o ingresar tu correo.')
      }

      const client = getInsforgeClient()
      const { error: signInError } = await client.auth.signInWithPassword({ email, password })
      if (signInError) throw new Error(signInError.message || 'Credenciales inválidas.')

      const current = await syncCurrentUser()
      if (!current) throw new Error('No se pudo obtener tu sesión después del login.')

      success.value = `¡Bienvenido, ${current.username}!`
      return true
    } catch (e) {
      error.value = e?.message || 'No se pudo iniciar sesión.'
      return false
    } finally {
      loading.value = false
    }
  }

  // ── LOGOUT ──
  async function logout() {
    clearSession()
    if (!INSFORGE_URL || !INSFORGE_ANON_KEY) return

    const client = getInsforgeClient()
    const { error: signOutError } = await client.auth.signOut()
    if (signOutError) {
      error.value = signOutError.message || 'No se pudo cerrar sesión completamente.'
    }
  }

  // ── GOOGLE OAUTH ──
  async function loginWithGoogle() {
    clearMessages()
    loading.value = true
    try {
      if (!ensureInsforgeConfig()) return false

      const client = getInsforgeClient()
      const { error: oauthError } = await client.auth.signInWithOAuth('google', {
        redirectTo: `${APP_URL}/login`,
      })

      if (oauthError) throw new Error(oauthError.message || 'No se pudo iniciar sesión con Google.')
      return true
    } catch (e) {
      error.value = e?.message || 'No se pudo iniciar sesión con Google.'
      return false
    } finally {
      loading.value = false
    }
  }

  // ── GITHUB OAUTH ──
  async function loginWithGitHub() {
    clearMessages()
    loading.value = true
    try {
      if (!ensureInsforgeConfig()) return false

      const client = getInsforgeClient()
      const { error: oauthError } = await client.auth.signInWithOAuth('github', {
        redirectTo: `${APP_URL}/login`,
      })

      if (oauthError) throw new Error(oauthError.message || 'No se pudo iniciar sesión con GitHub.')
      return true
    } catch (e) {
      error.value = e?.message || 'No se pudo iniciar sesión con GitHub.'
      return false
    } finally {
      loading.value = false
    }
  }

  // ── OAUTH CALLBACK (se llama al montar LoginView) ──
  async function handleOAuthCallback() {
    clearMessages()
    if (!ensureInsforgeConfig()) return false

    const params = new URLSearchParams(window.location.search)
    const hasOAuthParams = params.has('insforge_code') || params.has('code')
    if (!hasOAuthParams) return false

    loading.value = true
    try {
      const current = await syncCurrentUser()
      if (!current) {
        throw new Error('No se pudo completar el callback de OAuth.')
      }

      history.replaceState(null, '', '/login')
      success.value = `¡Bienvenido, ${current.username}!`
      return true
    } catch (e) {
      error.value = e?.message || 'No se pudo completar el inicio de sesión con OAuth.'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    user, loading, error, success,
    isLoggedIn, username,
    register, login, logout,
    loginWithGoogle, loginWithGitHub,
    handleOAuthCallback, clearMessages,
  }
})
