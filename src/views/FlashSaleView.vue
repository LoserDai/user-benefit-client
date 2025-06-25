<template>
  <div class="flash-sale">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>限时秒杀</h1>
      <p>精选商品限时秒杀，错过再等一年</p>
    </div>

    <!-- 倒计时横幅 -->
    <div class="countdown-banner">
      <div class="countdown-content">
        <h2>距离下一场秒杀还有</h2>
        <div class="countdown-timer">
          <div class="time-unit">
            <span class="time-number">{{ countdown.hours }}</span>
            <span class="time-label">时</span>
          </div>
          <div class="time-separator">:</div>
          <div class="time-unit">
            <span class="time-number">{{ countdown.minutes }}</span>
            <span class="time-label">分</span>
          </div>
          <div class="time-separator">:</div>
          <div class="time-unit">
            <span class="time-number">{{ countdown.seconds }}</span>
            <span class="time-label">秒</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 秒杀商品列表 -->
    <div class="flash-sale-grid">
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in flashSaleItems" :key="item.id">
          <el-card class="flash-sale-card">
            <div class="flash-sale-header">
              <el-tag type="danger" size="large">限时秒杀</el-tag>
              <div class="item-countdown">
                <span>{{ item.countdown }}</span>
              </div>
            </div>
            <img :src="item.image" :alt="item.name" class="flash-sale-image" />
            <div class="flash-sale-info">
              <h3>{{ item.name }}</h3>
              <p class="item-desc">{{ item.description }}</p>
              <div class="flash-sale-price">
                <span class="current-price">¥{{ item.currentPrice }}</span>
                <span class="original-price">¥{{ item.originalPrice }}</span>
                <span class="discount">{{ item.discount }}折</span>
              </div>
              <div class="flash-sale-progress">
                <div class="progress-info">
                  <span>已售{{ item.soldCount }}/{{ item.totalCount }}</span>
                  <span>剩余{{ item.remainingCount }}</span>
                </div>
                <el-progress
                  :percentage="item.soldPercentage"
                  :stroke-width="8"
                  :show-text="false"
                  color="#f56c6c"
                />
              </div>
              <div class="flash-sale-actions">
                <el-button
                  type="danger"
                  size="large"
                  :disabled="item.remainingCount === 0"
                  @click="buyFlashSale(item)"
                >
                  {{ item.remainingCount === 0 ? '已售罄' : '立即抢购' }}
                </el-button>
                <el-button @click="addToCart(item)"> 加入购物车 </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 即将开始 -->
    <div class="upcoming-section">
      <h2>即将开始</h2>
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in upcomingItems" :key="item.id">
          <el-card class="upcoming-card">
            <div class="upcoming-header">
              <el-tag type="warning">即将开始</el-tag>
              <div class="start-time">{{ item.startTime }}</div>
            </div>
            <img :src="item.image" :alt="item.name" class="upcoming-image" />
            <div class="upcoming-info">
              <h3>{{ item.name }}</h3>
              <div class="upcoming-price">
                <span class="current-price">¥{{ item.currentPrice }}</span>
                <span class="original-price">¥{{ item.originalPrice }}</span>
              </div>
              <el-button type="warning" size="small" @click="setReminder(item)">
                设置提醒
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const countdown = ref({
  hours: '00',
  minutes: '00',
  seconds: '00',
})

let countdownTimer: number | null = null

// 秒杀商品数据
const flashSaleItems = ref([
  {
    id: 1,
    name: 'VIP会员年卡',
    description: '年度VIP会员，享受全年专属服务',
    image: 'https://via.placeholder.com/300x200/409eff/ffffff?text=VIP年卡',
    currentPrice: 299,
    originalPrice: 399,
    discount: 7.5,
    countdown: '02:30:15',
    soldCount: 75,
    totalCount: 100,
    remainingCount: 25,
    soldPercentage: 75,
  },
  {
    id: 2,
    name: '流量包20GB',
    description: '大容量流量包，适合重度用户',
    image: 'https://via.placeholder.com/300x200/67c23a/ffffff?text=流量包20GB',
    currentPrice: 29.9,
    originalPrice: 49.9,
    discount: 6.0,
    countdown: '01:45:30',
    soldCount: 60,
    totalCount: 100,
    remainingCount: 40,
    soldPercentage: 60,
  },
  {
    id: 3,
    name: '话费充值200元',
    description: '话费充值立享优惠，到账快速',
    image: 'https://via.placeholder.com/300x200/e6a23c/ffffff?text=话费200元',
    currentPrice: 180,
    originalPrice: 200,
    discount: 9.0,
    countdown: '00:30:45',
    soldCount: 85,
    totalCount: 100,
    remainingCount: 15,
    soldPercentage: 85,
  },
  {
    id: 4,
    name: '电影票券5张',
    description: '全国影院通用电影票，支持在线选座',
    image: 'https://via.placeholder.com/300x200/f56c6c/ffffff?text=电影票5张',
    currentPrice: 150,
    originalPrice: 225,
    discount: 6.7,
    countdown: '03:15:20',
    soldCount: 45,
    totalCount: 100,
    remainingCount: 55,
    soldPercentage: 45,
  },
])

// 即将开始的商品
const upcomingItems = ref([
  {
    id: 5,
    name: 'KTV欢唱券',
    description: '全国连锁KTV通用，支持在线预约',
    image: 'https://via.placeholder.com/300x200/909399/ffffff?text=KTV券',
    currentPrice: 88,
    originalPrice: 128,
    startTime: '20:00',
  },
  {
    id: 6,
    name: '美食优惠券',
    description: '全国知名餐厅通用优惠券',
    image: 'https://via.placeholder.com/300x200/67c23a/ffffff?text=美食券',
    currentPrice: 50,
    originalPrice: 80,
    startTime: '21:00',
  },
  {
    id: 7,
    name: '游戏充值券',
    description: '热门游戏充值券，支持多款游戏',
    image: 'https://via.placeholder.com/300x200/409eff/ffffff?text=游戏券',
    currentPrice: 100,
    originalPrice: 150,
    startTime: '22:00',
  },
  {
    id: 8,
    name: '健身月卡',
    description: '全国连锁健身房通用月卡',
    image: 'https://via.placeholder.com/300x200/e6a23c/ffffff?text=健身卡',
    currentPrice: 199,
    originalPrice: 299,
    startTime: '23:00',
  },
])

// 倒计时逻辑
const updateCountdown = () => {
  // 这里应该根据实际的下场秒杀时间计算
  // 现在使用模拟数据
  const now = new Date()
  const target = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2小时后
  const diff = target.getTime() - now.getTime()

  if (diff > 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    countdown.value = {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    }
  }
}

// 方法
const buyFlashSale = (item: any) => {
  if (item.remainingCount > 0) {
    ElMessage.success(`正在抢购: ${item.name}`)
    item.remainingCount--
    item.soldCount++
    item.soldPercentage = Math.round((item.soldCount / item.totalCount) * 100)
  }
}

const addToCart = (item: any) => {
  ElMessage.success(`已将 ${item.name} 加入购物车`)
}

const setReminder = (item: any) => {
  ElMessage.success(`已设置 ${item.name} 的秒杀提醒`)
}

// 生命周期
onMounted(() => {
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.flash-sale {
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

.countdown-banner {
  background: linear-gradient(135deg, #f56c6c 0%, #e6a23c 100%);
  color: white;
  padding: 40px;
  border-radius: 8px;
  margin-bottom: 40px;
  text-align: center;
}

.countdown-content h2 {
  margin: 0 0 20px 0;
  font-size: 24px;
}

.countdown-timer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.time-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.time-number {
  font-size: 48px;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 15px;
  border-radius: 8px;
  min-width: 60px;
  text-align: center;
}

.time-label {
  font-size: 16px;
  margin-top: 8px;
}

.time-separator {
  font-size: 48px;
  font-weight: bold;
  margin-top: -20px;
}

.flash-sale-grid {
  margin-bottom: 40px;
}

.flash-sale-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 450px;
  margin-bottom: 20px;
}

.flash-sale-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.flash-sale-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-countdown {
  font-size: 14px;
  color: #f56c6c;
  font-weight: bold;
}

.flash-sale-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 12px;
}

.flash-sale-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.item-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
  height: 40px;
  overflow: hidden;
}

.flash-sale-price {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.original-price {
  font-size: 14px;
  color: #c0c4cc;
  text-decoration: line-through;
}

.discount {
  font-size: 12px;
  color: #f56c6c;
  background: #fef0f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.flash-sale-progress {
  margin-bottom: 12px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.flash-sale-actions {
  display: flex;
  gap: 8px;
}

.upcoming-section {
  margin-top: 40px;
}

.upcoming-section h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
}

.upcoming-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 300px;
  margin-bottom: 20px;
}

.upcoming-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.upcoming-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.start-time {
  font-size: 14px;
  color: #e6a23c;
  font-weight: bold;
}

.upcoming-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 12px;
}

.upcoming-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.upcoming-price {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section {
  margin-bottom: 48px;
  padding-left: 8px;
  padding-right: 8px;
}
</style>
