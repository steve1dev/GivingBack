<template>
  <div class="login-page">
    <BackButton class="login-back-btn" theme="onDark" fallback="/" label="Back" />

    <div class="container" :class="{ active: showRegister }">

    <!-- LOGIN FORM -->
    <div class="form-box login">
      <form @submit.prevent>
        <h1>Login</h1>

        <div class="input-box">
          <input v-model="loginData.username" type="text" placeholder="Username" autocomplete="username" required />
          <i class='bx bxs-user'></i>
        </div>

        <div class="input-box">
          <input v-model="loginData.password" type="password" placeholder="Password" autocomplete="current-password" required
            @keydown.enter="handleLogin" />
          <i class='bx bxs-lock-alt'></i>
        </div>

        <div class="forgot-link">
          <a href="#" @click.prevent="handleForgot">Forgot Password?</a>
        </div>

        <button type="button" class="btn" :disabled="auth.loading" @click="handleLogin">
          {{ auth.loading ? 'Ingresando...' : 'Login' }}
        </button>

        <p>or login with social platforms</p>
        <div class="social-icons">
          <a href="#" @click.prevent="auth.loginWithGoogle()"><i class='bx bxl-google'></i></a>
          <a href="#" @click.prevent="showSoon"><i class='bx bxl-facebook'></i></a>
          <a href="#" @click.prevent="auth.loginWithGitHub()"><i class='bx bxl-github'></i></a>
          <a href="#" @click.prevent="showSoon"><i class='bx bxl-linkedin'></i></a>
        </div>
      </form>
    </div>

    <!-- REGISTER FORM -->
    <div class="form-box register">
      <form @submit.prevent>
        <h1>Registration</h1>

        <div class="input-box">
          <input v-model="regData.username" type="text" placeholder="Username" autocomplete="username" required />
          <i class='bx bxs-user'></i>
        </div>

        <div class="input-box">
          <input v-model="regData.email" type="email" placeholder="Email" autocomplete="email" required />
          <i class='bx bxs-envelope'></i>
        </div>

        <div class="input-box">
          <input v-model="regData.password" type="password" placeholder="Password" autocomplete="new-password" required />
          <i class='bx bxs-lock-alt'></i>
        </div>

        <button type="button" class="btn" :disabled="auth.loading" @click="handleRegister">
          {{ auth.loading ? 'Registrando...' : 'Register' }}
        </button>

        <p>or register with social platforms</p>
        <div class="social-icons">
          <a href="#" @click.prevent="auth.loginWithGoogle()"><i class='bx bxl-google'></i></a>
          <a href="#" @click.prevent="showSoon"><i class='bx bxl-facebook'></i></a>
          <a href="#" @click.prevent="auth.loginWithGitHub()"><i class='bx bxl-github'></i></a>
          <a href="#" @click.prevent="showSoon"><i class='bx bxl-linkedin'></i></a>
        </div>
      </form>
    </div>

    <!-- TOGGLE PANEL -->
    <div class="toggle-box">
      <div class="toggle-panel toggle-left">
        <h1>The change starts now!</h1>
        <p>Don't have an account?</p>
        <button class="btn register-btn" @click="showRegister = true">Register</button>
      </div>
      <div class="toggle-panel toggle-right">
        <h1>The change starts now!</h1>
        <p>Already have an account?</p>
        <button class="btn login-btn" @click="showRegister = false">Login</button>
      </div>
    </div>

    <!-- NOTIFICATION -->
    <Transition name="notif">
      <div v-if="notification.show" class="auth-notification" :class="`auth-notification--${notification.type}`">
        {{ notification.message }}
      </div>
    </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import BackButton from '../components/BackButton.vue'

const auth        = useAuthStore()
const router      = useRouter()
const showRegister = ref(false)

const loginData = ref({ username: '', password: '' })
const regData   = ref({ username: '', email: '', password: '' })

// ── Notification ──────────────────────────────────────────
const notification = ref({ show: false, message: '', type: 'error' })
let notifTimer = null

function showNotif(message, type = 'error') {
  clearTimeout(notifTimer)
  notification.value = { show: true, message, type }
  notifTimer = setTimeout(() => { notification.value.show = false }, 3000)
}

// Watch store messages
watch(() => auth.error, val => { if (val) { showNotif(val, 'error'); auth.clearMessages() } })
watch(() => auth.success, val => { if (val) { showNotif(val, 'success'); auth.clearMessages() } })

// ── Handlers ──────────────────────────────────────────────
async function handleLogin() {
  const ok = await auth.login(loginData.value.username, loginData.value.password)
  if (ok) setTimeout(() => router.push('/'), 1200)
}

async function handleRegister() {
  const ok = await auth.register(regData.value.username, regData.value.email, regData.value.password)
  if (ok) {
    regData.value = { username: '', email: '', password: '' }
    setTimeout(() => {
      showRegister.value = false
      router.push('/')
    }, 1200)
  }
}

function handleForgot() {
  const email = prompt('Ingresa tu correo para restablecer tu contraseña:')
  if (email) showNotif('Enlace de restablecimiento enviado a ' + email + ' (requiere backend).', 'success')
}

function showSoon() {
  showNotif('Facebook y LinkedIn próximamente.')
}

// ── OAuth callback on mount ────────────────────────────────
onMounted(async () => {
  // Redirect if already logged in
  if (auth.isLoggedIn) { router.push('/'); return }

  // Handle OAuth redirect
  const ok = await auth.handleOAuthCallback()
  if (ok) setTimeout(() => router.push('/'), 1200)
})
</script>

<style scoped>
@import '../assets/css/login.css';

.notif-enter-active, .notif-leave-active { transition: opacity 0.4s; }
.notif-enter-from, .notif-leave-to       { opacity: 0; }
</style>
