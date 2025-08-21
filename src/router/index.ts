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
      meta: {
        title: '权益产品',
        keepAlive: false,
      },
    },
    {
      path: '/packages',
      name: 'packages',
      component: () => import('../views/client/PackagesView.vue'),
      meta: {
        title: '权益包',
        keepAlive: false,
      },
    },
    {
      path: '/flash-sale',
      name: 'flashSale',
      component: () => import('../views/client/FlashSaleView.vue'),
      meta: {
        title: '限时秒杀',
        keepAlive: false,
      },
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
  console.log('=== 路由守卫调试信息 ===')
  console.log('从:', from.path)
  console.log('到:', to.path)
  console.log('路由元信息:', to.meta)

  // 更新页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 权益商城`
  } else {
    document.title = '权益商城'
  }

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

// 路由跳转后的处理
router.afterEach((to, from) => {
  console.log('=== 路由跳转完成 ===')
  console.log('跳转完成 - 从:', from.path, '到:', to.path)

  // 滚动到页面顶部
  window.scrollTo(0, 0)

  // 强制刷新页面内容（如果路由跳转有问题）
  if (from.path !== to.path) {
    console.log('路由已改变，页面应该更新')
  }
})

export default router
