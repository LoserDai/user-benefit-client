import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductsView.vue'),
    },
    {
      path: '/packages',
      name: 'packages',
      component: () => import('../views/PackagesView.vue'),
    },
    {
      path: '/flash-sale',
      name: 'flashSale',
      component: () => import('../views/FlashSaleView.vue'),
    },
    {
      path: '/points',
      name: 'points',
      component: () => import('../views/PointsView.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/CartView.vue'),
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrdersView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchView.vue'),
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要登录
  if (to.meta.requiresAuth) {
    // 检查本地存储中的登录状态
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
    const currentUser = localStorage.getItem('currentUser')

    if (!isLoggedIn || !currentUser) {
      // 未登录，跳转到首页并显示登录提示
      next('/')
      return
    }
  }

  next()
})

export default router
