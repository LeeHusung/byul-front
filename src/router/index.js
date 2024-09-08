import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import board from '@/views/Board.vue'
import Register from '@/views/Register.vue'
import Home from '@/views/Home.vue'
import Board from '@/views/Board.vue'
import BoardDetail from '@/views/BoardDetail.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/board',
    name: 'board',
    component: Board
  },
  {
    path: '/board',
    name: 'board',
    component: board
  },
  {
    path: '/board/:id',
    name: 'BoardDetail',
    component: BoardDetail
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
