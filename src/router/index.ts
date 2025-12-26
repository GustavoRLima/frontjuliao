import { createRouter, createWebHistory } from 'vue-router'
import Welcome from '../views/Welcome.vue'
import AthleteRegistration from '../views/AthleteRegistration.vue'

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
    }
  ]
})

export default router

