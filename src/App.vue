<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type MessageOptions } from 'element-plus'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { userApi } from '@/api/user'
import { Goods } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 响应式数据
const activeIndex = ref('/')
const searchKeyword = ref('')
const showLoginDialog = ref(false)
const showRegisterDialog = ref(false)
const cartCount = ref(5) // 增加初始购物车数量
const isLoggedIn = ref(false)
const currentUser = ref('') // 当前登录用户名
const userAvatar = ref('https://picsum.photos/200/200?random=1')
const currentYear = new Date().getFullYear()
const isScrolled = ref(false)

// 从本地存储恢复登录状态
const restoreLoginState = () => {
  const savedUser = localStorage.getItem('currentUser')
  const savedLoginState = localStorage.getItem('isLoggedIn')

  if (savedUser && savedLoginState === 'true') {
    currentUser.value = savedUser
    isLoggedIn.value = true

    // 可选：验证服务器端登录状态
    // validateServerLoginState()
  }
}

// 验证服务器端登录状态（可选）
const validateServerLoginState = async () => {
  try {
    // 这里可以调用后端接口验证登录状态
    // const response = await userApi.validateLogin()
    // if (!response.valid) {
    //   // 如果服务器端登录已失效，清除本地状态
    //   clearLoginState()
    // }
  } catch (error) {
    // 如果验证失败，清除本地状态
    clearLoginState()
  }
}

// 清除登录状态
const clearLoginState = () => {
  isLoggedIn.value = false
  currentUser.value = ''
  localStorage.removeItem('currentUser')
  localStorage.removeItem('isLoggedIn')
}

// 用户名查重相关
const accountChecking = ref(false)
const accountExists = ref(false)
const accountAvailable = ref(false)

// 登录表单
const loginForm = reactive({
  account: '',
  password: '',
})

// 注册表单 - 移除邮箱字段
const registerForm = reactive({
  account: '',
  password: '',
  confirmPassword: '',
})

// 表单引用
const loginFormRef = ref()
const registerFormRef = ref()

// 表单验证规则
const loginRules = {
  account: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const registerRules = {
  account: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      validator: async (rule: any, value: string, callback: Function) => {
        if (!value) {
          callback()
          return
        }

        // 检查用户名是否已存在
        try {
          accountChecking.value = true
          const response = await userApi.checkUsername(value)
          // 如果请求成功，说明用户名可用
          accountExists.value = false
          accountAvailable.value = true
          callback()
        } catch (error: any) {
          console.error('检查用户名失败:', error)
          // 如果错误码是40002，说明用户已存在
          if (error.code === 40002) {
            accountExists.value = true
            accountAvailable.value = false
            callback(new Error('用户名已存在'))
          } else {
            callback(new Error('检查用户名失败，请重试'))
          }
        } finally {
          accountChecking.value = false
        }
      },
      trigger: 'blur',
    },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

// 方法
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/search?keyword=${encodeURIComponent(searchKeyword.value)}`)
  }
}

const handleLogin = async () => {
  try {
    // 验证表单
    await loginFormRef.value.validate()

    const response = await userApi.login({
      account: loginForm.account,
      password: loginForm.password,
    })

    showMessage('登录成功', 'success')
    isLoggedIn.value = true
    currentUser.value = loginForm.account // 设置当前登录用户名

    // 保存登录状态到本地存储
    localStorage.setItem('currentUser', loginForm.account)
    localStorage.setItem('isLoggedIn', 'true')

    showLoginDialog.value = false
    loginForm.account = ''
    loginForm.password = ''
  } catch (error: any) {
    if (error.message) {
      showMessage(error.message, 'error')
    } else {
      showMessage('登录失败，请检查用户名和密码', 'error')
    }
  }
}

const handleRegister = async () => {
  try {
    // 只做表单校验，异步查重逻辑已在表单规则里
    await registerFormRef.value.validate()

    const response = await userApi.register({
      account: registerForm.account,
      password: registerForm.password,
      checkPassword: registerForm.confirmPassword,
    })

    showMessage('注册成功', 'success')
    showRegisterDialog.value = false
    registerForm.account = ''
    registerForm.password = ''
    registerForm.confirmPassword = ''
    // 重置状态
    accountExists.value = false
    accountAvailable.value = false
  } catch (error: any) {
    if (error.message) {
      showMessage(error.message, 'error')
    } else {
      showMessage('注册失败，请重试', 'error')
    }
  }
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      if (!isLoggedIn.value) {
        showMessage('请先登录', 'warning')
        showLoginDialog.value = true
        return
      }
      router.push('/profile')
      break
    case 'orders':
      if (!isLoggedIn.value) {
        showMessage('请先登录', 'warning')
        showLoginDialog.value = true
        return
      }
      router.push('/orders')
      break
    case 'logout':
      clearLoginState()
      showMessage('已退出登录', 'success')
      // 退出登录后跳转到主页面
      router.push('/')
      break
  }
}

// 自定义消息提示
const showMessage = (message: string, type: MessageOptions['type']) => {
  ElMessage({
    message,
    type,
    duration: 1500,
    customClass: 'message-custom',
  })
}

// 滚动监听
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // 恢复登录状态
  restoreLoginState()
})

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}
</script>

<template>
  <div id="app">
    <!-- 顶部导航栏 -->
    <el-header :class="['header', { 'header-scrolled': isScrolled }]">
      <div class="header-content">
        <div class="logo">
          <img src="@/assets/favicon.ico" alt="权益商城" class="logo-img" />
          <span class="logo-text">权益商城</span>
        </div>

        <div class="nav-menu">
          <el-menu
            mode="horizontal"
            :default-active="activeIndex"
            router
            class="nav-horizontal-menu"
            :unique-opened="false"
          >
            <el-menu-item index="/" class="nav-item">首页</el-menu-item>
            <el-menu-item index="/products" class="nav-item">权益产品</el-menu-item>
            <el-menu-item index="/packages" class="nav-item">权益包</el-menu-item>
            <el-menu-item index="/flash-sale" class="nav-item">秒杀</el-menu-item>
            <el-menu-item index="/points" class="nav-item">积分兑换</el-menu-item>
          </el-menu>
        </div>

        <div class="header-right">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品..."
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <el-button type="primary" icon-only @click="handleSearch">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>

          <div class="user-actions">
            <el-button
              v-if="!isLoggedIn"
              type="primary"
              @click="showLoginDialog = true"
              :class="{ 'btn-hover': isLoggedIn }"
              >登录</el-button
            >
            <el-button
              v-if="!isLoggedIn"
              @click="showRegisterDialog = true"
              :class="{ 'btn-outline': isLoggedIn }"
              >注册</el-button
            >

            <el-dropdown v-if="isLoggedIn" @command="handleUserCommand" trigger="click">
              <div class="user-dropdown">
                <el-avatar :size="36" :src="userAvatar" class="user-avatar">
                  <el-icon><User /></el-icon>
                </el-avatar>
                <span class="user-name">{{ currentUser || '用户' }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu class="user-dropdown-menu">
                  <el-dropdown-item command="profile" class="dropdown-item">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="orders" class="dropdown-item">
                    <el-icon><Sell /></el-icon>我的订单
                  </el-dropdown-item>
                  <el-dropdown-item command="logout" class="dropdown-item">
                    <el-icon><Close /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-badge :value="cartCount" class="cart-badge" :is-dot="cartCount > 9">
              <el-button circle @click="$router.push('/cart')" class="cart-button">
                <el-icon><ShoppingCart /></el-icon>
              </el-button>
            </el-badge>
          </div>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-main class="main-content">
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </el-main>

    <!-- 底部版权信息 -->
    <el-footer class="footer">
      <div class="footer-content">
        <div class="footer-info">
          <p class="footer-copyright">&copy; {{ currentYear }} 权益商城. 保留所有权利.</p>
          <p class="footer-author">软件作者: Allen</p>
          <p class="footer-tech">技术支持: Vue 3 + Element Plus</p>
        </div>
        <div class="footer-links">
          <a href="https://github.com/LoserDai" target="_blank">关于我们</a>
          <a href="#">服务条款</a>
          <a href="#">隐私政策</a>
          <a href="https://t.me/Allen_dai" target="_blank">联系我们</a>
        </div>
      </div>
    </el-footer>

    <!-- 登录对话框 -->
    <el-dialog v-model="showLoginDialog" title="用户登录" width="400px" class="dialog-custom">
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px">
        <el-form-item prop="username" label="用户名">
          <el-input v-model="loginForm.account" placeholder="请输入用户名" class="input-custom" />
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            class="input-custom"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showLoginDialog = false">取消</el-button>
          <el-button type="primary" @click="handleLogin">登录</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 注册对话框 -->
    <el-dialog v-model="showRegisterDialog" title="用户注册" width="400px" class="dialog-custom">
      <el-form
        :model="registerForm"
        :rules="registerRules"
        ref="registerFormRef"
        label-width="80px"
      >
        <el-form-item prop="account" label="用户名">
          <el-input
            v-model="registerForm.account"
            placeholder="请输入用户名"
            class="input-custom"
            :loading="accountChecking"
          >
            <template #suffix>
              <el-icon v-if="accountChecking" class="is-loading">
                <Loading />
              </el-icon>
              <el-icon v-else-if="accountAvailable" style="color: #67c23a">
                <CircleCheck />
              </el-icon>
              <el-icon v-else-if="accountExists" style="color: #f56c6c">
                <CircleClose />
              </el-icon>
            </template>
          </el-input>
          <div
            v-if="accountAvailable"
            class="username-tip success"
            style="color: #67c23a !important"
          >
            用户名可用
          </div>
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            class="input-custom"
          />
        </el-form-item>
        <el-form-item prop="confirmPassword" label="确认密码">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            class="input-custom"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRegisterDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleRegister"
            :disabled="accountExists || accountChecking"
          >
            注册
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 基础颜色定义 */
:root {
  --primary-color: #409eff;
  --primary-light: #ecf5ff;
  --secondary-color: #67c23a;
  --accent-color: #e6a23c;
  --text-color: #303133;
  --text-secondary: #606266;
  --background-color: #f5f7fa;
  --card-background: #ffffff;
  --border-color: #dcdfe6;
}
.header-right :deep(.search-input .el-input__wrapper) {
  padding: 1px 1px !important;
}

#app {
  min-height: 100vh; /* 使页面至少占满整个视口高度 */
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
  width: 100%;
  margin: 0;
  padding: 0;
}

/* 导航栏优化 */
.header {
  background: var(--card-background);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: all 0.3s ease;
  padding: 0;
}

.header-scrolled {
  padding: 0;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(5px);
}

.header-content {
  max-width: 1300px; /* 调整为更大的宽度，避免菜单被挤压 */
  width: 100%;
  margin: 0 auto;
  padding: 0 60px; /* 增加内边距，确保元素不紧凑 */
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-img {
  width: 36px;
  height: 36px;
  transition: transform 0.3s ease;
}

.logo-img:hover {
  transform: scale(1.05);
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
  background: linear-gradient(to right, var(--primary-color), #69b1ff);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav-menu {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-horizontal-menu {
  border-bottom: none;
}

.nav-item {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-color);
  transition: all 0.2s ease;
  position: relative;
  padding: 0 25px; /* 增加菜单项间距 */
}

.nav-item:hover {
  color: var(--primary-color);
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.nav-item:hover::after,
.nav-item.is-active::after {
  width: 60%;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 30px; /* 增加右侧元素间距 */
}

.search-input {
  width: 380px;
  transition: width 0.3s ease;
}

.search-input:focus-within {
  width: 440px;
}

/* 按钮样式优化 */
.btn-hover {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-hover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(to right, transparent, var(--primary-color), transparent);
  animation: btnShine 2s infinite;
}

@keyframes btnShine {
  0% {
    background-position: -100% 0;
  }
  100% {
    background-position: 100% 0;
  }
}

.btn-outline {
  border: 1px solid var(--border-color);
  color: var(--text-color);
  transition: all 0.3s ease;
}

.btn-outline:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

/* 用户区域样式 */
.user-actions {
  display: flex;
  align-items: center;
  gap: 15px; /* 增加用户区域元素间距 */
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.user-avatar {
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.3);
}

.user-name {
  font-size: 14px;
  color: var(--text-color);
  font-weight: 500;
}

.user-dropdown-menu {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

/* 购物车样式 */
.cart-badge {
  margin-left: 0; /* 移除左侧边距 */
}

.cart-button {
  transition: all 0.3s ease;
}

.cart-button:hover {
  background-color: var(--primary-light);
  color: var(--primary-color);
}

/* 页脚样式 */
.footer {
  flex-shrink: 0;
  width: 100%;
  text-align: center;
  background: var(--card-background);
  border-top: 1px solid var(--border-color);
}

.footer-content {
  max-width: 100%; /* 调整为更大的宽度 */
  margin: 0 auto;
  padding: 32px 80px 24px 80px; /* 增加内边距 */
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.footer-copyright {
  font-weight: 500;
  color: var(--text-color);
  font-size: 16px;
}

.footer-author {
  font-size: 16px;
  color: var(--primary-color);
}

.footer-tech {
  font-size: 14px;
  color: var(--text-secondary);
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 40px; /* 增加链接间距 */
  font-size: 15px;
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
  font-weight: 500;
  position: relative;
}

.footer-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 1px;
  background-color: var(--primary-color);
  transition: width 0.3s ease;
}

.footer-links a:hover {
  color: var(--primary-color);
}

.footer-links a:hover::after {
  width: 100%;
}

@media (max-width: 1200px) {
  .header-content,
  .footer-content {
    padding: 0 30px;
  }

  .nav-item {
    padding: 0 20px;
  }

  .footer-links {
    gap: 30px;
  }
}

@media (max-width: 900px) {
  .footer-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
    padding: 24px 20px 16px 20px;
  }
  .footer-links {
    gap: 18px;
    font-size: 14px;
  }
  .footer-info {
    font-size: 14px;
  }

  .header-content {
    padding: 0 20px;
  }

  .search-input {
    width: 240px;
  }

  .search-input:focus-within {
    width: 300px;
  }
}

/* 主要内容区域 */
.main-content {
  flex: auto;
  margin-top: 70px;
  padding: 0px 0px;
  box-sizing: border-box;
}

@media (max-width: 1200px) {
  .main-content {
    padding: 40px 40px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 30px 20px;
  }
}

/* 对话框样式 */
.dialog-custom {
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dialog-custom .el-dialog__header {
  padding: 20px 30px;
  border-bottom: 1px solid var(--border-color);
}

.dialog-custom .el-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
}

.dialog-custom .el-dialog__body {
  padding: 20px 30px;
}

.dialog-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 10px 30px 20px;
  border-top: 1px solid var(--border-color);
}

/* 输入框样式 */
.input-custom {
  transition: all 0.3s ease;
}

.input-custom:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 用户名提示样式 */
.username-tip {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.4;
  transition: all 0.3s ease;
}

.username-tip.success {
  color: #67c23a !important;
  font-weight: 500;
}
</style>
