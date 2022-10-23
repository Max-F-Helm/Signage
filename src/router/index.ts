import { createRouter, createWebHistory } from 'vue-router'
import StartView from '../views/StartView.vue'
import HomeView from '../views/HomeView.vue'
import IdentitiesView from '../views/IdentitiesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/start',
      name: 'start',
      component: StartView
    },
    {
      path: '/identities',
      name: 'identities',
      component: IdentitiesView
    }/*,
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }*/
  ]
})

export default router
