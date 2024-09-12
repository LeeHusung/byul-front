import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Register from '@/views/Register.vue';
import Home from '@/views/Home.vue';
import Board from '@/views/Board.vue';
import BoardDetail from '@/views/BoardDetail.vue';
import Mine from '@/views/Mine.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
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
    path: '/board/:id',
    name: 'BoardDetail',
    component: BoardDetail
  },
  {
    path: '/my',
    name: 'Mine',
    component: Mine
  },
  {
    path: '/board/:id/edit',
    name: 'UpdateBoard',
    component: () => import('@/views/UpdateBoard.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
