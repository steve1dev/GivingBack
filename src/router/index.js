import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/camera',
    name: 'Camera',
    component: () => import('../views/RecyclingCamera.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/Adquirir',
    name: 'Adquirir',
    component: () => import('../views/GivingBackAdd.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/Giving-Map',
    name: 'Giving-Map',
    component: () => import('../views/GivingMapView.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/Account',
    name: 'Account',
    component: () => import('../views/AccountView.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/Learn',
    name: 'Learn',
    component: () => import('../views/LearnView.vue'),
    meta: { requiresAuth: true },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Navigation guard — protege rutas que requieren autenticación
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'Login' }
  }
})

export default router
