import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Welcome from '../views/Welcome.vue'
import AthleteRegistration from '../views/AthleteRegistration.vue'
import TeamRegistration from '../views/TeamRegistration.vue'
import Login from '../views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Welcome
    },
    {
      path: '/atleta',
      name: 'athlete',
      component: AthleteRegistration
    },
    {
      path: '/equipe',
      name: 'team',
      component: TeamRegistration
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { redirectIfAuthenticated: true }
    }
  ]
})

// Guard de navegação global
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Redirecionar para home se usuário já estiver autenticado e tentar acessar login
  if (to.meta.redirectIfAuthenticated && authStore.isAuthenticated) {
    next('/')
    return
  }

  // Verificar se a rota requer autenticação
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }

  next()
})

export default router

