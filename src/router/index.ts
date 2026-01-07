import { createRouter, createWebHistory } from 'vue-router'
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
      component: Login
    }
  ]
})

export default router

