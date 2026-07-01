// router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/campeonato/:id',
    name: 'campeonato',
    component: () => import('@/views/CampeonatoView.vue'),
    props: true
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: () => import('@/views/CadastroView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(), // Remove o VITE_BASE_URL daqui
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router