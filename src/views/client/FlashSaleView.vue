<template>
  <div class="flash-sale">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>限时秒杀</h1>
      <p>精选商品限时秒杀，错过再等一年</p>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchActivityName"
            placeholder="搜索活动名称..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-select v-model="selectedActivityType" placeholder="活动类型" clearable>
            <el-option label="全部类型" value="" />
            <el-option label="百分比折扣" value="PERCENT_DISCOUNT" />
            <el-option label="金额折扣" value="AMOUNT_DISCOUNT" />
            <el-option label="买赠活动" value="GIFT" />
            <el-option label="限时活动" value="LIMITED" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-input
            v-model="searchPrice"
            placeholder="输入价格进行筛选..."
            type="number"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>Coin</template>
          </el-input>
        </el-col>
      </el-row>
      <!-- 搜索按钮 -->
      <el-row :gutter="20" style="margin-top: 15px">
        <el-col :span="24" style="text-align: center">
          <el-button type="primary" @click="handleSearch" :loading="isLoading"> 搜索 </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 秒杀活动列表 -->
    <div class="flash-sale-grid">
      <el-row :gutter="20">
        <el-col :span="8" v-for="activity in flashSaleActivities" :key="activity.id">
          <el-card class="flash-sale-card">
            <div class="flash-sale-header">
              <el-tag :type="getActivityTypeColor(activity.activityType)" size="large">{{
                getActivityTypeText(activity.activityType)
              }}</el-tag>
              <div class="item-countdown">
                <span>{{ activityCountdowns[activity.id] || '00:00:00' }}</span>
              </div>
            </div>

            <!-- 活动图片 -->
            <div class="image-container">
              <img
                v-if="activity.activityImagePath"
                :src="getImageUrl(activity.activityImagePath)"
                :alt="activity.activityName || '秒杀活动'"
                class="flash-sale-image"
                @error="handleImageError"
                @load="handleImageLoad"
                loading="lazy"
              />
              <div v-else class="no-image-placeholder">
                <span>暂无图片</span>
              </div>
            </div>

            <div class="flash-sale-info">
              <h3>{{ activity.activityName || '秒杀活动' }}</h3>
              <p class="item-desc">{{ activity.description || '暂无描述' }}</p>

              <div class="flash-sale-price">
                <span class="current-price">Coin: {{ activity.price || 0 }}</span>
                <span v-if="activity.discountValue" class="discount"
                  >{{ activity.discountValue }}折</span
                >
              </div>

              <div class="activity-meta">
                <span class="meta-item">开始: {{ formatTime(activity.startTime) }}</span>
                <span class="meta-item">结束: {{ formatTime(activity.endTime) }}</span>
              </div>

              <div class="flash-sale-actions">
                <el-button
                  type="danger"
                  size="large"
                  :disabled="!isActivityActive(activity)"
                  @click="buyFlashSale(activity)"
                >
                  {{ isActivityActive(activity) ? '立即抢购' : '活动结束' }}
                </el-button>
                <el-button @click="addToCart(activity)"> 加入购物车 </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 分页 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[6, 12, 18, 24]"
        :total="totalActivities"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-section">
      <el-skeleton :rows="3" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { activityApi } from '@/api/user'
import { BACKEND_CONFIG } from '@/config/backend'

const router = useRouter()

// 筛选和分页数据
const searchActivityName = ref('')
const selectedActivityType = ref('')
const searchPrice = ref('')
const currentPage = ref(1)
const pageSize = ref(6)
const totalActivities = ref(0)
const isLoading = ref(false)

// 秒杀活动数据
const flashSaleActivities = ref<any[]>([])
const activityCountdowns = ref<{ [key: number]: string }>({})

// 获取秒杀活动列表
const fetchActivities = async () => {
  if (isLoading.value) return
  isLoading.value = true

  const params: any = {
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    status: 'ONGOING', // 只查询进行中的活动
  }

  // 活动名称搜索
  if (searchActivityName.value && searchActivityName.value.trim() !== '') {
    params.activityName = searchActivityName.value.trim()
  }

  // 活动类型筛选
  if (selectedActivityType.value && selectedActivityType.value.trim() !== '') {
    params.activityType = selectedActivityType.value
  }

  // 价格筛选
  if (searchPrice.value && searchPrice.value.trim() !== '') {
    params.price = Number(searchPrice.value)
  }

  try {
    const res = await activityApi.queryActivityList(params)
    console.log('秒杀活动API响应:', res)
    flashSaleActivities.value = res.data?.data || []
    totalActivities.value = res.data?.total || 0

    // 初始化所有活动的倒计时
    updateAllActivityCountdowns()

    console.log('处理后的秒杀活动数据:', flashSaleActivities.value)
    console.log('总数:', totalActivities.value)
  } catch (e) {
    console.error('获取秒杀活动失败:', e)
    ElMessage.error('获取秒杀活动失败')
  } finally {
    isLoading.value = false
  }
}

// 监听分页变化自动请求
watch(
  [currentPage, pageSize],
  () => {
    if (flashSaleActivities.value.length > 0 || currentPage.value > 1) {
      fetchActivities()
    }
  },
  { immediate: false },
)

// 监听筛选条件变化，自动搜索（带防抖）
let searchTimer: number | null = null
watch(
  [searchActivityName, selectedActivityType, searchPrice],
  () => {
    // 清除之前的定时器
    if (searchTimer) {
      clearTimeout(searchTimer)
    }

    // 设置新的定时器，500ms后自动搜索
    searchTimer = setTimeout(() => {
      if (flashSaleActivities.value.length > 0) {
        currentPage.value = 1
        fetchActivities()
      }
    }, 500)
  },
  { immediate: false },
)

// 组件初始化标记
const isInitialized = ref(false)

onMounted(() => {
  if (!isInitialized.value) {
    fetchActivities()
    isInitialized.value = true
  }
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
  fetchActivities()
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  searchActivityName.value = ''
  selectedActivityType.value = ''
  searchPrice.value = ''
  currentPage.value = 1
  fetchActivities()
  ElMessage.success('筛选条件已重置')
}

const buyFlashSale = (activity: any) => {
  if (isActivityActive(activity)) {
    ElMessage.success(`正在抢购: ${activity.activityName || '秒杀活动'}`)
  }
}

const addToCart = (activity: any) => {
  ElMessage.success(`已将 ${activity.activityName || '秒杀活动'} 加入购物车`)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 工具方法
const getRemainingTime = (endTime: string) => {
  if (!endTime) return '00:00:00'

  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) return '已结束'

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 活动类型转换
const getActivityTypeText = (activityType: string) => {
  const typeMap: { [key: string]: string } = {
    PERCENT_DISCOUNT: '百分比折扣',
    AMOUNT_DISCOUNT: '金额折扣',
    GIFT: '买赠活动',
  }
  return typeMap[activityType] || '百分比折扣'
}

// 活动类型颜色映射
const getActivityTypeColor = (activityType: string) => {
  const colorMap: { [key: string]: string } = {
    PERCENT_DISCOUNT: 'success', // 绿色 - 折扣活动
    AMOUNT_DISCOUNT: 'warning', // 橙色 - 金额折扣
    GIFT: 'primary', // 蓝色 - 买赠活动
  }
  return colorMap[activityType] || 'danger'
}

// 更新所有活动的倒计时
const updateAllActivityCountdowns = () => {
  flashSaleActivities.value.forEach((activity) => {
    if (activity.endTime) {
      const now = new Date()
      const end = new Date(activity.endTime)
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        activityCountdowns.value[activity.id] = '已结束'
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        activityCountdowns.value[activity.id] =
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
    } else {
      activityCountdowns.value[activity.id] = '00:00:00'
    }
  })
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return '--'
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

const isActivityActive = (activity: any) => {
  if (!activity.startTime || !activity.endTime) return false

  const now = new Date()
  const start = new Date(activity.startTime)
  const end = new Date(activity.endTime)

  return now >= start && now <= end
}

// 图片URL处理
const getImageUrl = (imagePath: string) => {
  return BACKEND_CONFIG.getImageUrl(imagePath)
}

// 图片加载处理
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.log('图片加载成功:', img.src)
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  console.warn('图片加载失败:', img.src)
  img.src = 'https://picsum.photos/300/200?text=暂无图片'
}

// 生命周期
onMounted(() => {
  // 初始化所有活动的倒计时
  const timer = setInterval(updateAllActivityCountdowns, 1000)

  onUnmounted(() => {
    clearInterval(timer)
  })
})

onUnmounted(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
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

.filter-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.filter-section .el-row {
  margin-bottom: 0;
}

.filter-section .el-col {
  margin-bottom: 10px;
}

.filter-section .el-input,
.filter-section .el-select {
  width: 100%;
}

.filter-section .el-button {
  margin-right: 10px;
  min-width: 100px;
}

.filter-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  text-align: center;
}

.flash-sale-grid {
  margin-bottom: 40px;
}

.flash-sale-card {
  cursor: pointer;
  transition: all 0.3s;
  min-height: 480px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
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

.flash-sale-header .el-tag {
  font-weight: 600;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-countdown {
  font-size: 14px;
  color: #f56c6c;
  font-weight: bold;
  background: rgba(245, 108, 108, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(245, 108, 108, 0.3);
}

.image-container {
  position: relative;
  width: 100%;
  height: 220px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  margin-bottom: 12px;
}

.flash-sale-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.flash-sale-image:hover {
  transform: scale(1.05);
}

.no-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
  font-size: 14px;
}

.flash-sale-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 0;
}

.flash-sale-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
  height: 40px;
  overflow: hidden;
  line-height: 1.4;
  font-weight: 600;
}

.item-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
  height: 40px;
  overflow: hidden;
  line-height: 1.5;
}

.flash-sale-price {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.current-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.discount {
  font-size: 12px;
  color: #f56c6c;
  background: #fef0f0;
  padding: 2px 6px;
  border-radius: 4px;
}

.activity-meta {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item {
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.flash-sale-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  justify-content: center;
}

.flash-sale-actions .el-button {
  flex: 1;
  max-width: 120px;
  height: 36px;
  font-weight: 500;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.flash-sale-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.loading-section {
  margin: 40px 0;
  padding: 20px;
}
</style>
