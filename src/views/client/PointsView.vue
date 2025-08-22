<template>
  <div class="points">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>积分兑换</h1>
      <p>积分兑换好礼，让积分更有价值</p>
    </div>

    <!-- 积分信息 -->
    <div class="points-info">
      <!-- 未登录提示 -->
      <div v-if="!isUserLoggedIn" class="login-required">
        <el-alert
          title="请先登录"
          description="登录后才能查看积分信息和进行兑换操作"
          type="info"
          show-icon
          :closable="false"
        />
      </div>

      <!-- 积分信息卡片 -->
      <el-row v-else :gutter="20">
        <el-col :span="6">
          <el-card class="points-card">
            <div class="points-item">
              <div class="points-icon">
                <el-icon :size="40"><Eleme /></el-icon>
              </div>
              <div class="points-content">
                <h3>我的Balance</h3>
                <p class="points-number">
                  <span v-if="isLoadingPoints">加载中...</span>
                  <span v-else>{{ userBalance }}</span>
                </p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="points-card">
            <div class="points-item">
              <div class="points-icon">
                <el-icon :size="40"><Coin /></el-icon>
              </div>
              <div class="points-content">
                <h3>我的积分</h3>
                <p class="points-number">
                  <span v-if="isLoadingPoints">加载中...</span>
                  <span v-else>{{ userPoints }}</span>
                </p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="points-card">
            <div class="points-item">
              <div class="points-icon">
                <el-icon :size="40"><shopping-cart-full /></el-icon>
              </div>
              <div class="points-content">
                <h3>已消费Balance</h3>
                <p class="points-number">
                  <span v-if="isLoadingPoints">加载中...</span>
                  <span v-else>{{ consumedBalance }}</span>
                </p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="points-card">
            <div class="points-item">
              <div class="points-icon">
                <el-icon :size="40"><shopping-cart-full /></el-icon>
              </div>
              <div class="points-content">
                <h3>已消费积分</h3>
                <p class="points-number">
                  <span v-if="isLoadingPoints">加载中...</span>
                  <span v-else>{{ consumedPoints }}</span>
                </p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 积分兑换区域 -->
    <div v-if="isUserLoggedIn" class="exchange-section">
      <h2>积分兑换</h2>
      <div class="exchange-form-vertical">
        <div class="exchange-row">
          <span class="exchange-label-left">{{ exchangeFromLabel }}</span>
          <div class="exchange-input-container">
            <el-input
              v-model="inputFrom"
              placeholder="请输入兑换金额"
              class="exchange-el-input"
              :max="exchangeDirection === 'balance-to-points' ? userBalance : userPoints"
              type="number"
              step="0.01"
              min="0.01"
              @input="debouncedValidate"
            />
            <div class="balance-hint">
              可用余额：{{ exchangeDirection === 'balance-to-points' ? userBalance : userPoints }}
              {{ exchangeFromLabel }}
              <el-button type="text" size="small" @click="setMaxAmount" class="max-amount-btn">
                全部兑换
              </el-button>
            </div>
          </div>
        </div>
        <div class="exchange-swap-row">
          <el-button
            icon="ArrowDown"
            @click="swapExchangeDirection"
            class="swap-btn-vertical"
            circle
          />
        </div>
        <div class="exchange-row">
          <span class="exchange-label-left">{{ exchangeToLabel }}</span>
          <el-input v-model="inputTo" placeholder="自动计算" class="exchange-el-input" disabled />
        </div>
        <div class="exchange-btn-row">
          <el-button type="primary" @click="handleExchange" class="exchange-btn">兑换</el-button>
        </div>
      </div>
      <div class="exchange-info">
        <div v-if="isLoadingConfig" class="config-loading">
          <el-icon class="is-loading"><Loading /></el-icon>
          加载配置中...
        </div>
        <div v-else>
          <div v-if="exchangeRate !== null">兑换率：1 Balance = {{ exchangeRate }} 积分</div>
          <div v-else class="config-loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            加载兑换配置中...
          </div>
          <div class="config-direction">
            当前配置：{{
              exchangeDirection === 'balance-to-points'
                ? 'B/P (卖出Balance买入积分)'
                : 'P/B (卖出积分买入Balance)'
            }}
          </div>
        </div>
      </div>
    </div>

    <!-- 兑换确认对话框 -->
    <el-dialog v-model="showExchangeDialog" title="确认兑换" width="400px">
      <div class="exchange-confirm">
        <p>
          确定要将 <b>{{ inputFrom }}</b> {{ exchangeFromLabel }} 兑换为 <b>{{ inputTo }}</b>
          {{ exchangeToLabel }} 吗？
        </p>

        <p class="exchange-summary">
          <span
            >兑换方向：{{
              exchangeDirection === 'balance-to-points'
                ? 'B/P (卖出Balance买入积分)'
                : 'P/B (卖出积分买入Balance)'
            }}</span
          >
        </p>
      </div>
      <template #footer>
        <el-button @click="showExchangeDialog = false">取消</el-button>
        <el-button type="primary" @click="createSwapOrder" :loading="isSubmittingOrder">
          {{ isSubmittingOrder ? '兑换中...' : '确认兑换' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api/user'
import { Loading } from '@element-plus/icons-vue'

// 扩展Window接口，添加自定义属性
declare global {
  interface Window {
    loginCheckInterval?: number
  }

  // 扩展CustomEvent接口，支持登录成功和退出登录事件
  interface CustomEventMap {
    loginSuccess: CustomEvent<{ username: string }>
    logoutSuccess: CustomEvent
  }
}

// 定义API错误类型
interface ApiError extends Error {
  code?: number
  response?: {
    status?: number
    data?: any
  }
}

// 定义兑换配置类型
interface SwapConfig {
  id: number
  userId: number
  rate: number
  ccy: string
}

// 定义兑换订单类型
interface SwapOrder {
  amountBuy: number
  amountSell: number
  ccy: string
  exchangeRate: number
}

// 用户信息 - 支持decimal类型
const userBalance = ref<string | number>('0') // 余额
const userPoints = ref<string | number>('0') // 积分
const consumedBalance = ref<string | number>('0') // 已消费的Balance
const consumedPoints = ref<string | number>('0') // 已消费的积分
const isLoadingPoints = ref(false) // 加载状态

// 获取兑换配置信息
const fetchSwapConfig = async (direction?: 'balance-to-points' | 'points-to-balance') => {
  if (isLoadingConfig.value) return

  // 根据兑换方向确定参数
  const targetDirection = direction || exchangeDirection.value
  const ccy = targetDirection === 'balance-to-points' ? 'B/P' : 'P/B'

  console.log('获取兑换配置，方向:', targetDirection, '参数:', ccy)

  isLoadingConfig.value = true

  try {
    const res = await userApi.getSwapConfig(ccy)
    console.log('兑换配置API响应:', res)

    if (res.data) {
      const newRate = res.data.rate

      // 检查兑换率是否有效
      if (newRate !== undefined && newRate !== null && newRate > 0) {
        console.log('设置兑换率:', newRate, '方向:', targetDirection, 'ccy:', ccy)
        // 更新当前配置
        exchangeRate.value = newRate
        console.log('兑换率已设置为:', exchangeRate.value)
      } else {
        console.error('后端返回的兑换率无效:', newRate)
        ElMessage.warning('兑换率配置无效，请稍后重试')
        return
      }

      console.log('更新后的兑换配置:', {
        rate: exchangeRate.value,
        direction: targetDirection,
        ccy: ccy,
      })
    }
  } catch (e) {
    console.error('获取兑换配置失败:', e)
    ElMessage.warning('获取兑换配置失败，请稍后重试')

    // 配置获取失败，不设置默认值
    console.log('配置获取失败，等待重试')
  } finally {
    isLoadingConfig.value = false
  }
}

// 根据兑换方向获取对应的配置
const getCurrentConfig = () => {
  // 检查兑换率是否已获取
  if (exchangeRate.value === null) {
    console.warn('兑换率尚未获取，无法计算兑换结果')
    return null
  }

  if (exchangeDirection.value === 'balance-to-points') {
    return {
      rate: exchangeRate.value,
    }
  } else {
    // 积分到Balance的兑换，使用反向配置
    return {
      rate: 1 / exchangeRate.value,
    }
  }
}

// 计算兑换结果（独立函数，避免重复代码）
const calculateExchangeResult = (from: number) => {
  const config = getCurrentConfig()

  // 检查配置是否可用
  if (!config) {
    inputTo.value = ''
    return
  }

  if (exchangeDirection.value === 'balance-to-points') {
    // 余额兑换积分
    inputTo.value = String(Number((from * config.rate).toFixed(2)))
  } else {
    // 积分兑换余额
    inputTo.value = String(Number((from * config.rate).toFixed(2)))
  }
}

// 防抖函数，避免频繁验证
let validateTimeout: number | null = null
const debouncedValidate = () => {
  if (validateTimeout) {
    clearTimeout(validateTimeout)
  }
  validateTimeout = setTimeout(() => {
    validateInput()
  }, 300) // 300ms防抖
}

// 更新已消费数据显示
const updateConsumedDisplay = async () => {
  try {
    const consumedRes = await userApi.queryConsumed('2')
    if (consumedRes.data) {
      const totalBalanceConsumed = Number(consumedRes.data.totalBalance) || 0
      const totalPointsConsumed = Number(consumedRes.data.totalPoints) || 0

      // 分别设置已消费的Balance和积分
      consumedBalance.value = totalBalanceConsumed.toFixed(2)
      consumedPoints.value = totalPointsConsumed.toFixed(2)

      console.log('已消费数据更新:', {
        totalBalanceConsumed,
        totalPointsConsumed,
        consumedBalance: consumedBalance.value,
        consumedPoints: consumedPoints.value,
      })
    }
  } catch (error) {
    console.error('更新已消费数据显示失败:', error)
  }
}

// 输入验证函数
const validateInput = () => {
  const from = Number(inputFrom.value)
  if (isNaN(from) || from <= 0) {
    inputTo.value = ''
    return
  }

  // 检查输入值是否超过可用余额
  const maxAmount =
    Number(
      exchangeDirection.value === 'balance-to-points' ? userBalance.value : userPoints.value,
    ) || 0

  // 如果可用余额为0，直接提示并返回
  if (maxAmount <= 0) {
    ElMessage.warning(
      `当前可用${exchangeDirection.value === 'balance-to-points' ? 'Balance' : '积分'}余额不足，无法进行兑换`,
    )
    inputTo.value = ''
    return
  }

  if (from > maxAmount) {
    ElMessage.warning(
      `输入值超过可用${exchangeDirection.value === 'balance-to-points' ? 'Balance' : '积分'}余额`,
    )
    // 自动调整到最大可用值
    inputFrom.value = String(maxAmount)
    return
  }

  // 检查兑换率是否已获取
  if (exchangeRate.value === null) {
    ElMessage.warning('兑换配置尚未加载完成，请稍后再试')
    inputTo.value = ''
    return
  }

  // 如果输入值有效，触发计算
  calculateExchangeResult(from)
}

// 设置最大兑换金额
const setMaxAmount = () => {
  const maxAmount =
    Number(
      exchangeDirection.value === 'balance-to-points' ? userBalance.value : userPoints.value,
    ) || 0

  // 如果可用余额为0，提示用户
  if (maxAmount <= 0) {
    ElMessage.warning(
      `当前可用${exchangeDirection.value === 'balance-to-points' ? 'Balance' : '积分'}余额不足，无法进行兑换`,
    )
    return
  }

  inputFrom.value = String(maxAmount)

  // 检查兑换率是否已获取
  if (exchangeRate.value === null) {
    ElMessage.warning('兑换配置尚未加载完成，请稍后再试')
    return
  }

  // 直接计算，避免重复验证
  calculateExchangeResult(maxAmount)

  ElMessage.success(`已设置为最大可用金额：${maxAmount}`)
}

// 创建兑换订单
const createSwapOrder = async () => {
  if (isSubmittingOrder.value) return

  const from = Number(inputFrom.value)
  const to = Number(inputTo.value)

  if (isNaN(from) || isNaN(to) || from <= 0 || to <= 0) {
    ElMessage.error('兑换金额无效')
    return
  }

  // 根据兑换方向确定参数
  const ccy = exchangeDirection.value === 'balance-to-points' ? 'B/P' : 'P/B'
  const config = getCurrentConfig()

  // 检查配置是否可用
  if (!config) {
    ElMessage.error('兑换配置尚未加载完成，请稍后再试')
    return
  }

  // 构建兑换订单数据
  const orderData: SwapOrder = {
    amountBuy: to, // 买入金额（兑换后获得）
    amountSell: from, // 卖出金额（兑换前拥有）
    ccy: ccy, // 兑换方向
    exchangeRate: config.rate, // 兑换率
  }

  console.log('创建兑换订单:', orderData)

  try {
    isSubmittingOrder.value = true

    const res = await userApi.createSwapOrder(orderData)
    console.log('兑换订单创建成功:', res)

    ElMessage.success('兑换订单创建成功！')

    // 关闭兑换对话框
    showExchangeDialog.value = false

    // 更新用户余额和积分
    if (exchangeDirection.value === 'balance-to-points') {
      // 余额兑换积分
      const currentBalance = Number(userBalance.value) || 0
      const currentPoints = Number(userPoints.value) || 0
      userBalance.value = (currentBalance - from).toFixed(2)
      userPoints.value = (currentPoints + to).toFixed(2)
    } else {
      // 积分兑换余额
      const currentBalance = Number(userBalance.value) || 0
      const currentPoints = Number(userPoints.value) || 0
      userPoints.value = (currentPoints - from).toFixed(2)
      userBalance.value = (currentBalance + to).toFixed(2)
    }

    // 重置输入值
    inputFrom.value = ''
    inputTo.value = ''

    // 重新获取用户数据（可选，确保数据同步）
    setTimeout(() => {
      fetchUserPoints()
    }, 1000)
  } catch (e) {
    console.error('创建兑换订单失败:', e)
    ElMessage.error('兑换失败，请重试')
  } finally {
    isSubmittingOrder.value = false
  }
}

// 获取用户积分和余额信息
const fetchUserPoints = async () => {
  if (isLoadingPoints.value) return

  // 检查用户是否已登录
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const currentUser = localStorage.getItem('currentUser')

  if (!isLoggedIn || !currentUser) {
    console.log('用户未登录，无法获取积分信息')
    ElMessage.warning('请先登录后再查看积分信息')

    // 清空数据
    userBalance.value = '0'
    userPoints.value = '0'
    consumedBalance.value = '0'
    consumedPoints.value = '0'
    return
  }

  isLoadingPoints.value = true

  try {
    // 查询积分和余额，传递默认的ccy参数
    // 这里使用 'B/P' 作为默认值，因为主要是查询用户的基本信息
    const res = await userApi.queryPoints('B/P')
    console.log('积分查询API响应:', res)

    // 根据后端返回的数据结构进行映射
    // 支持decimal类型，后端返回的数据结构为 { balance: string|number, points: string|number }
    if (res.data) {
      userBalance.value = res.data.balance || '0'
      userPoints.value = res.data.points || '0'
    }

    // 查询已消费金额
    try {
      const consumedRes = await userApi.queryConsumed('2') // 查询已消费，默认传2
      console.log('已消费查询API响应:', consumedRes)

      if (consumedRes.data) {
        // 根据新的接口返回结构处理数据
        const totalBalanceConsumed = Number(consumedRes.data.totalBalance) || 0
        const totalPointsConsumed = Number(consumedRes.data.totalPoints) || 0

        // 分别设置已消费的Balance和积分
        consumedBalance.value = totalBalanceConsumed.toFixed(2)
        consumedPoints.value = totalPointsConsumed.toFixed(2)

        console.log('已消费数据处理:', {
          totalBalanceConsumed,
          totalPointsConsumed,
          consumedBalance: consumedBalance.value,
          consumedPoints: consumedPoints.value,
        })
      } else {
        consumedBalance.value = '0'
        consumedPoints.value = '0'
      }
    } catch (consumedError) {
      console.error('获取已消费数据失败:', consumedError)
      consumedBalance.value = '0'
      consumedPoints.value = '0'
    }

    console.log('处理后的用户数据:', {
      balance: userBalance.value,
      points: userPoints.value,
      consumedBalance: consumedBalance.value,
      consumedPoints: consumedPoints.value,
    })
  } catch (e) {
    console.error('获取用户积分信息失败:', e)

    // 检查是否是401未授权错误
    const apiError = e as ApiError
    if (apiError.code === 401 || apiError.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      // 清除本地登录状态
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('currentUser')
      // 清空数据
      userBalance.value = '0'
      userPoints.value = '0'
      consumedBalance.value = '0'
      consumedPoints.value = '0'
    } else {
      ElMessage.error('获取用户积分信息失败')
      // 设置默认值
      userBalance.value = '0'
      userPoints.value = '0'
      consumedBalance.value = '0'
      consumedPoints.value = '0'
    }
  } finally {
    isLoadingPoints.value = false
  }
}

// 积分兑换相关
const exchangeDirection = ref<'balance-to-points' | 'points-to-balance'>('balance-to-points')
const showExchangeDialog = ref(false)
const exchangeRate = ref<number | null>(null) // 兑换率，初始为null，等待接口获取
const isLoadingConfig = ref(false) // 配置加载状态
const isSubmittingOrder = ref(false) // 兑换订单提交状态

// inputFrom/inputTo 类型调整为字符串，便于el-input
const inputFrom = ref('')
const inputTo = ref('')

const exchangeFromLabel = computed(() =>
  exchangeDirection.value === 'balance-to-points' ? 'Balance' : '积分',
)
const exchangeToLabel = computed(() =>
  exchangeDirection.value === 'balance-to-points' ? '积分' : 'Balance',
)
const exchangeFromMax = computed(() => {
  const balance = Number(userBalance.value) || 0
  const points = Number(userPoints.value) || 0
  return exchangeDirection.value === 'balance-to-points' ? balance : points
})

// 计算用户是否已登录
const isUserLoggedIn = computed(() => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const currentUser = localStorage.getItem('currentUser')
  return isLoggedIn && !!currentUser
})

watch([inputFrom, exchangeDirection], () => {
  const from = Number(inputFrom.value)
  if (isNaN(from) || from <= 0) {
    inputTo.value = ''
    return
  }

  // 检查输入值是否超过可用余额
  const maxAmount =
    Number(
      exchangeDirection.value === 'balance-to-points' ? userBalance.value : userPoints.value,
    ) || 0

  // 如果可用余额为0，直接返回
  if (maxAmount <= 0) {
    inputTo.value = ''
    return
  }

  if (from > maxAmount) {
    // 自动调整到最大可用值，但不显示警告（避免重复提示）
    inputFrom.value = String(maxAmount)
    return
  }

  // 检查兑换率是否已获取
  if (exchangeRate.value === null) {
    inputTo.value = ''
    return
  }

  // 如果输入值有效，触发计算
  calculateExchangeResult(from)
})

function swapExchangeDirection() {
  const newDirection =
    exchangeDirection.value === 'balance-to-points' ? 'points-to-balance' : 'balance-to-points'
  exchangeDirection.value = newDirection

  // 切换方向后重置输入值
  inputFrom.value = ''
  inputTo.value = ''

  // 切换方向后重新获取对应的配置
  console.log('兑换方向切换为:', newDirection)
  fetchSwapConfig(newDirection)

  // 切换方向后更新已消费数据显示
  updateConsumedDisplay()

  // 等待配置获取完成后再计算
  // 这里不直接计算，因为配置可能还在加载中
}

function handleExchange() {
  // 检查用户是否已登录
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const currentUser = localStorage.getItem('currentUser')

  if (!isLoggedIn || !currentUser) {
    ElMessage.warning('请先登录后再进行兑换操作')
    return
  }

  const from = Number(inputFrom.value)
  if (isNaN(from) || from <= 0) {
    ElMessage.warning('请输入有效的兑换金额')
    return
  }

  // 检查输入值是否超过可用余额
  const maxAmount =
    Number(
      exchangeDirection.value === 'balance-to-points' ? userBalance.value : userPoints.value,
    ) || 0

  // 如果可用余额为0，直接提示
  if (maxAmount <= 0) {
    const currencyName = exchangeDirection.value === 'balance-to-points' ? 'Balance' : '积分'
    ElMessage.warning(`当前可用${currencyName}余额不足，无法进行兑换`)
    return
  }

  if (from > maxAmount) {
    const currencyName = exchangeDirection.value === 'balance-to-points' ? 'Balance' : '积分'
    ElMessage.warning(`${currencyName}余额不足，当前可用：${maxAmount}`)
    return
  }

  showExchangeDialog.value = true
}

// 监听登录状态变化
const checkLoginStatus = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const currentUser = localStorage.getItem('currentUser')

  if (!isLoggedIn || !currentUser) {
    console.log('检测到用户未登录，清空积分数据')
    // 清空数据
    userBalance.value = '0'
    userPoints.value = '0'
    consumedBalance.value = '0'
    consumedPoints.value = '0'
  }
}

// 监听localStorage变化（主要用于跨标签页同步）
const handleStorageChange = (e: StorageEvent) => {
  if (e.key === 'isLoggedIn' || e.key === 'currentUser') {
    console.log('检测到跨标签页登录状态变化:', e.key, e.newValue)

    // 检查是否是登录成功
    if (e.key === 'isLoggedIn' && e.newValue === 'true') {
      console.log('检测到跨标签页用户登录成功，自动刷新积分数据')
      // 延迟一下，确保登录状态完全更新
      setTimeout(() => {
        fetchUserPoints()
      }, 500)
    } else if (e.key === 'isLoggedIn' && e.newValue === 'false') {
      console.log('检测到跨标签页用户退出登录，清空积分数据')
      checkLoginStatus()
    } else if (e.key === 'currentUser') {
      console.log('检测到跨标签页用户信息变化，检查登录状态')
      checkLoginStatus()
    }
  }
}

// 监听登录成功事件（支持跨组件通信）
const handleLoginSuccess = () => {
  console.log('收到登录成功事件，自动刷新积分数据和兑换配置')
  // 延迟一下，确保登录状态完全更新
  setTimeout(async () => {
    await fetchUserPoints()
    // 登录成功后获取兑换配置
    await fetchSwapConfig('balance-to-points')
  }, 500)
}

// 监听退出登录事件
const handleLogoutSuccess = () => {
  console.log('收到退出登录事件，清空积分数据')
  // 立即清空数据
  userBalance.value = '0'
  userPoints.value = '0'
  consumedBalance.value = '0'
  consumedPoints.value = '0'
}

// 组件挂载时获取用户积分信息和兑换配置
onMounted(async () => {
  fetchUserPoints()

  // 检查用户是否已登录，如果已登录则获取配置
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const currentUser = localStorage.getItem('currentUser')

  if (isLoggedIn && currentUser) {
    // 只获取当前方向的配置，避免覆盖
    await fetchSwapConfig('balance-to-points')
  }

  // 添加localStorage变化监听
  window.addEventListener('storage', handleStorageChange)

  // 添加登录成功事件监听
  window.addEventListener('loginSuccess', handleLoginSuccess)

  // 添加退出登录事件监听
  window.addEventListener('logoutSuccess', handleLogoutSuccess)

  // 添加定期检查登录状态（只在未登录时频繁检查）
  const loginCheckInterval = setInterval(() => {
    if (!isUserLoggedIn.value) {
      checkLoginStatus()
    }
  }, 3000) // 未登录时每3秒检查一次

  // 保存定时器引用，用于清理
  window.loginCheckInterval = loginCheckInterval
})

// 组件卸载时清理监听器
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('loginSuccess', handleLoginSuccess)
  window.removeEventListener('logoutSuccess', handleLogoutSuccess)

  // 清理定时器
  if (window.loginCheckInterval) {
    clearInterval(window.loginCheckInterval)
    delete window.loginCheckInterval
  }

  // 清理防抖定时器
  if (validateTimeout) {
    clearTimeout(validateTimeout)
  }
})
</script>

<style scoped>
.points {
  padding: 40px 0 0 0;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  color: #303133;
  margin-bottom: 12px;
}

.page-header p {
  font-size: 16px;
  color: #606266;
  margin-bottom: 16px;
}

.login-required {
  margin-bottom: 20px;
  text-align: center;
}

.points-info {
  margin-bottom: 40px;
}

.points-card {
  text-align: center;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.points-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.points-icon {
  color: #409eff;
}

.points-content h3 {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 16px;
}

.points-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin: 0;
}

.filter-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.points-grid {
  margin-bottom: 40px;
}

.points-item-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 400px;
  margin-bottom: 20px;
  position: relative;
}

.points-item-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.item-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
}

.item-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  padding: 12px 0;
}

.item-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
  height: 40px;
  overflow: hidden;
}

.item-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
  height: 40px;
  overflow: hidden;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.exchange-count,
.stock-count {
  font-size: 12px;
  color: #909399;
}

.points-required {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.points-required .points-number {
  font-size: 20px;
  font-weight: bold;
  color: #e6a23c;
}

.points-required .points-label {
  font-size: 14px;
  color: #e6a23c;
}

.points-required .original-price {
  font-size: 12px;
  color: #c0c4cc;
}

.item-actions {
  display: flex;
  gap: 8px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.exchange-confirm {
  text-align: center;
}

.confirm-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 16px;
}

.exchange-confirm h3 {
  margin: 0 0 12px 0;
  color: #303133;
}

.exchange-confirm p {
  margin: 8px 0;
  color: #606266;
}

.exchange-summary {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  border-left: 3px solid #409eff;
}

.exchange-summary span {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

.section {
  margin-bottom: 48px;
  padding-left: 8px;
  padding-right: 8px;
}
.exchange-section {
  margin: 40px auto 0 auto;
  max-width: 600px;
  background: #f9fafc;
  border-radius: 12px;
  padding: 32px 24px 24px 24px;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.08);
}
.exchange-section h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #409eff;
}
.exchange-form {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 18px;
}
.exchange-input-large {
  width: 140px !important;
  font-size: 22px !important;
  height: 48px !important;
}
.exchange-label {
  font-size: 18px;
  color: #606266;
  min-width: 48px;
  text-align: center;
}
.swap-btn {
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #409eff;
  font-size: 20px;
  margin: 0 8px;
}
.exchange-btn {
  font-size: 18px;
  padding: 0 28px;
  height: 48px;
}
.exchange-info {
  text-align: center;
  color: #909399;
  font-size: 15px;
  margin-top: 8px;
  line-height: 2;
}

.config-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.config-loading .el-icon {
  font-size: 16px;
}

.config-direction {
  font-size: 12px;
  color: #67c23a;
  margin-top: 4px;
  padding: 4px 8px;
  background: #f0f9ff;
  border-radius: 4px;
  border: 1px solid #b3d8ff;
}
.exchange-form-vertical {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  margin-bottom: 18px;
}
.exchange-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 8px;
}
.exchange-label-left {
  font-size: 18px;
  color: #606266;
  min-width: 80px;
  text-align: right;
  margin-right: 12px;
}
.exchange-el-input {
  width: 220px !important;
  font-size: 22px !important;
  height: 48px !important;
}

.exchange-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.balance-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 8px;
}

.max-amount-btn {
  color: #409eff;
  font-size: 12px;
  padding: 0;
  height: auto;
}

.max-amount-btn:hover {
  color: #66b1ff;
}
.exchange-swap-row {
  margin: 8px 0 8px 0;
}
.swap-btn-vertical {
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #409eff;
  font-size: 22px;
}
.exchange-btn-row {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}
</style>
