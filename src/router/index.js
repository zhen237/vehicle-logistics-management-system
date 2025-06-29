import { createRouter, createWebHashHistory } from 'vue-router';
import Login from '@/views/Login/index.vue';
import Layout from '@/views/Layout/index.vue';

const router= createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Layout',
      component: Layout,
      redirect: '/home',
      children: [
        {
          path: 'home',
          name: 'Home',
          component: () => import('@/views/Home/index.vue'),
        },
        {
          path: 'user',
          name: 'User',
          component: () => import('@/views/User/index.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
  ],
});
export default router;
