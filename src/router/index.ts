import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/client/HomeView.vue'

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
      component: () => import('../views/client/ProductsView.vue'),
    },
    {
      path: '/packages',
      name: 'packages',
      component: () => import('../views/client/PackagesView.vue'),
    },
    {
      path: '/flash-sale',
      name: 'flashSale',
      component: () => import('../views/client/FlashSaleView.vue'),
    },
    {
      path: '/points',
      name: 'points',
      component: () => import('../views/client/PointsView.vue'),
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../views/client/CartView.vue'),
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/client/OrdersView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/client/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/client/SearchView.vue'),
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
