<template>
  <div class="points">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>积分兑换</h1>
      <p>积分兑换好礼，让积分更有价值</p>
    </div>

    <!-- 积分信息 -->
    <div class="points-info">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card class="points-card">
            <div class="points-item">
              <div class="points-icon">
                <el-icon :size="40"><Eleme /></el-icon>
              </div>
              <div class="points-content">
                <h3>我的Balance</h3>
                <p class="points-number">{{ userBalance }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="points-card">
            <div class="points-item">
              <div class="points-icon">
                <el-icon :size="40"><Coin /></el-icon>
              </div>
              <div class="points-content">
                <h3>我的积分</h3>
                <p class="points-number">{{ userPoints }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="points-card">
            <div class="points-item">
              <div class="points-icon">
                <el-icon :size="40"><shopping-cart-full /></el-icon>
              </div>
              <div class="points-content">
                <h3>已消费</h3>
                <p class="points-number">{{ consumedAmount }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 积分兑换区域 -->
    <div class="exchange-section">
      <h2>积分兑换</h2>
      <div class="exchange-form-vertical">
        <div class="exchange-row">
          <span class="exchange-label-left">{{ exchangeFromLabel }}</span>
          <el-input v-model="inputFrom" placeholder="请输入内容" class="exchange-el-input" />
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
        <div>兑换率：1 Balance = {{ exchangeRate }} 积分</div>
        <div>手续费：{{ feeRate * 100 }}%</div>
      </div>
    </div>

    <!-- 兑换确认对话框 -->
    <el-dialog v-model="showExchangeDialog" title="确认兑换" width="400px">
      <div class="exchange-confirm">
        <p>
          确定要将 <b>{{ inputFrom }}</b> {{ exchangeFromLabel }} 兑换为 <b>{{ inputTo }}</b>
          {{ exchangeToLabel }} 吗？
        </p>
        <p>手续费：{{ feeAmount }} {{ exchangeFromLabel }}</p>
      </div>
      <template #footer>
        <el-button @click="showExchangeDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmExchange">确认兑换</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

// 用户信息
const userBalance = ref(100.5) // 余额
const userPoints = ref(2580) // 积分
const consumedAmount = ref(500) // 已消费

// 积分兑换相关
const exchangeDirection = ref<'balance-to-points' | 'points-to-balance'>('balance-to-points')
const showExchangeDialog = ref(false)
const exchangeRate = 10 // 1余额=10积分
const feeRate = 0.02 // 2%手续费

// inputFrom/inputTo 类型调整为字符串，便于el-input
const inputFrom = ref('1')
const inputTo = ref('')

const exchangeFromLabel = computed(() =>
  exchangeDirection.value === 'balance-to-points' ? 'Balance' : '积分',
)
const exchangeToLabel = computed(() =>
  exchangeDirection.value === 'balance-to-points' ? '积分' : 'Balance',
)
const exchangeFromMax = computed(() =>
  exchangeDirection.value === 'balance-to-points' ? userBalance.value : userPoints.value,
)

const feeAmount = computed(() => {
  if (exchangeDirection.value === 'balance-to-points') {
    return (Number(inputFrom.value) * feeRate).toFixed(2)
  } else {
    return Math.floor(Number(inputFrom.value) * feeRate)
  }
})

watch([inputFrom, exchangeDirection], () => {
  const from = Number(inputFrom.value)
  if (isNaN(from) || from <= 0) {
    inputTo.value = ''
    return
  }
  if (exchangeDirection.value === 'balance-to-points') {
    // 余额兑换积分
    let afterFee = from - from * feeRate
    inputTo.value = String(Math.floor(afterFee * exchangeRate))
  } else {
    // 积分兑换余额
    let afterFee = from - Math.floor(from * feeRate)
    inputTo.value = String(Number((afterFee / exchangeRate).toFixed(2)))
  }
})

function swapExchangeDirection() {
  exchangeDirection.value =
    exchangeDirection.value === 'balance-to-points' ? 'points-to-balance' : 'balance-to-points'
  inputFrom.value = '1'
}

function handleExchange() {
  const from = Number(inputFrom.value)
  if (isNaN(from) || from <= 0) return
  if (exchangeDirection.value === 'balance-to-points' && from > userBalance.value) {
    ElMessage.warning('Balance不足')
    return
  }
  if (exchangeDirection.value === 'points-to-balance' && from > userPoints.value) {
    ElMessage.warning('积分不足')
    return
  }
  showExchangeDialog.value = true
}

function confirmExchange() {
  const from = Number(inputFrom.value)
  if (exchangeDirection.value === 'balance-to-points') {
    const fee = from * feeRate
    const realFrom = from - fee
    const points = Math.floor(realFrom * exchangeRate)
    userBalance.value -= from
    userPoints.value += points
    ElMessage.success(`成功将${from}Balance兑换为${points}积分（手续费${fee.toFixed(2)}Balance）`)
  } else {
    const fee = Math.floor(from * feeRate)
    const realFrom = from - fee
    const balance = Number((realFrom / exchangeRate).toFixed(2))
    userPoints.value -= from
    userBalance.value += balance
    ElMessage.success(`成功将${from}积分兑换为${balance}Balance（手续费${fee}积分）`)
  }
  showExchangeDialog.value = false
}
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
