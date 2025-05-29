import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './views/Dashboard.vue';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import Account from './components/Account.vue'; 

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/account', name: 'Account', component: Account, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }
  next();
});

export default router;
