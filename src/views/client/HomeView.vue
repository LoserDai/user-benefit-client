<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { productApi, packageApi, activityApi } from '@/api/user'
import { BACKEND_CONFIG } from '@/config/backend'

interface Banner {
  id: number
  title: string
  description: string
  // buttonText: string
  image: string
}

interface QuickAccessItem {
  id: number
  title: string
  description: string
  icon: string
  route: string
}

interface Product {
  id: number
  name: string
  description: string
  image: string
  currentPrice: number
  originalPrice: number
}

interface PackageItem {
  id: number
  name: string
  tag: string
  tagType: string
  description: string
  features: string[]
  currentPrice: number
  originalPrice: number
}

interface FlashSaleItem {
  id: number
  name: string
  image: string
  currentPrice: number
  originalPrice: number
  countdown: string
  soldPercentage: number
}

const router = useRouter()

const banners = ref<Banner[]>([
  {
    id: 1,
    title: '新人专享礼包',
    description: '注册即送100积分，新人专享权益等你来拿',
    // buttonText: '立即注册',
    image: '/src/assets/banner_1.png',
  },
  {
    id: 2,
    title: '限时秒杀活动',
    description: '精选商品限时秒杀，错过再等一年',
    image: '/src/assets/banner_2.png',
  },
  {
    id: 3,
    title: '积分兑换专区',
    description: '积分兑换好礼，让积分更有价值',
    // buttonText: '立即兑换',
    image: '/src/assets/banner_3.png',
  },
])

const quickAccess = ref<QuickAccessItem[]>([
  {
    id: 1,
    title: '权益产品',
    description: '精选各类权益产品',
    icon: 'shoppingBag',
    route: '/products',
  },
  {
    id: 2,
    title: '权益包',
    description: '超值权益组合包',
    icon: 'Box',
    route: '/packages',
  },
  {
    id: 3,
    title: '秒杀专区',
    description: '限时秒杀抢购',
    icon: 'Clock',
    route: '/flash-sale',
  },
  {
    id: 4,
    title: '积分兑换',
    description: '积分兑换好礼',
    icon: 'Points',
    route: '/points',
  },
])

const hotProducts = ref<any[]>([])
const isLoadingHotProducts = ref(false)

const recommendedPackages = ref<any[]>([])
const isLoadingPackages = ref(false)

const flashSaleItems = ref<any[]>([])
const isLoadingFlashSale = ref(false)

const handleBannerClick = (banner: Banner) => {
  ElMessage.success(`点击了: ${banner.title}`)
}

const handleQuickAccess = (item: QuickAccessItem) => {
  router.push(item.route)
}

const addToCart = (product: any) => {
  ElMessage.success(`已将 ${product.productName || '权益产品'} 加入购物车`)
}

const addPackageToCart = (pkg: any) => {
  ElMessage.success(`已将 ${pkg.packageName || pkg.remark || '权益包'} 加入购物车`)
}

const addFlashSaleToCart = (item: any) => {
  ElMessage.success(`已将 ${item.activityName || '秒杀活动'} 加入购物车`)
}

// 获取热门权益产品
const fetchHotProducts = async () => {
  if (isLoadingHotProducts.value) return
  isLoadingHotProducts.value = true

  try {
    const params = {
      pageNum: 1,
      pageSize: 4,
      status: 'ACTIVE',
    }

    const res = await productApi.queryAllProduct(params)
    console.log('热门产品API响应:', res)
    hotProducts.value = res.data?.data || []
    console.log('处理后的热门产品数据:', hotProducts.value)
  } catch (e) {
    console.error('获取热门产品失败:', e)
    ElMessage.error('获取热门产品失败')
  } finally {
    isLoadingHotProducts.value = false
  }
}

// 获取推荐权益包
const fetchRecommendedPackages = async () => {
  if (isLoadingPackages.value) return
  isLoadingPackages.value = true

  try {
    const params = {
      pageNum: 1,
      pageSize: 3,
      status: 'ACTIVE',
    }

    const res = await packageApi.queryPackage(params)
    console.log('推荐权益包API响应:', res)
    recommendedPackages.value = res.data?.data || []
    console.log('处理后的推荐权益包数据:', recommendedPackages.value)
  } catch (e) {
    console.error('获取推荐权益包失败:', e)
    ElMessage.error('获取推荐权益包失败')
  } finally {
    isLoadingPackages.value = false
  }
}

// 获取限时秒杀活动
const fetchFlashSaleActivities = async () => {
  if (isLoadingFlashSale.value) return
  isLoadingFlashSale.value = true

  try {
    const params = {
      pageNum: 1,
      pageSize: 4,
      status: 'ONGOING',
    }

    const res = await activityApi.queryActivityList(params)
    console.log('限时秒杀API响应:', res)
    flashSaleItems.value = res.data?.data || []
    console.log('处理后的限时秒杀数据:', flashSaleItems.value)
  } catch (e) {
    console.error('获取限时秒杀失败:', e)
    ElMessage.error('获取限时秒杀失败')
  } finally {
    isLoadingFlashSale.value = false
  }
}

// 组件挂载时获取热门产品、推荐权益包和限时秒杀
onMounted(() => {
  fetchHotProducts()
  fetchRecommendedPackages()
  fetchFlashSaleActivities()
})

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
  // 设置默认图片
  img.src = 'https://picsum.photos/300/200?text=暂无图片'
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

const formatTime = (timeStr: string) => {
  if (!timeStr) return '--'
  const date = new Date(timeStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
}

// 统一的查看更多处理函数
const handleViewMore = (route: string) => {
  console.log('=== 路由跳转调试信息 ===')
  console.log('当前路由:', router.currentRoute.value.path)
  console.log('目标路由:', `/${route}`)
  console.log('路由实例:', router)

  // 使用 router.push 而不是 replace，保持正确的浏览器历史记录
  try {
    console.log('尝试使用 router.push 跳转...')
    router
      .push(`/${route}`)
      .then(() => {
        console.log('路由跳转成功')
      })
      .catch((error) => {
        console.error('router.push 失败:', error)
        // 如果路由跳转失败，使用 window.location
        console.log('使用 window.location 跳转...')
        window.location.href = `/${route}`
      })
  } catch (error) {
    console.error('路由跳转异常:', error)

    // 如果路由跳转失败，使用 window.location
    console.log('使用 window.location 跳转...')
    window.location.href = `/${route}`
  }
}
</script>

<template>
  <div class="home">
    <el-carousel height="400px" class="banner">
      <el-carousel-item v-for="banner in banners" :key="banner.id">
        <div class="banner-item" :style="{ backgroundImage: `url(${banner.image})` }">
          <div class="banner-content">
            <h2>{{ banner.title }}</h2>
            <p>{{ banner.description }}</p>
            <!-- <el-button type="primary" size="large" @click="handleBannerClick(banner)">
               {{ banner.buttonText }}
            </el-button> -->
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>

    <div class="quick-access">
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in quickAccess" :key="item.id">
          <el-card class="quick-access-card" @click="handleQuickAccess(item)">
            <div class="quick-access-icon">
              <el-icon :size="40">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="section">
      <div class="section-header">
        <h2>热门权益产品</h2>
        <el-button text @click="handleViewMore('products')">
          查看更多 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoadingHotProducts" class="loading-section">
        <el-skeleton :rows="3" animated />
      </div>

      <!-- 产品列表 -->
      <el-row v-else :gutter="20">
        <el-col :span="6" v-for="product in hotProducts" :key="product.id">
          <el-card class="product-card">
            <!-- 产品图片 -->
            <div class="image-container">
              <img
                v-if="product.productImagePath"
                :src="getImageUrl(product.productImagePath)"
                :alt="product.productName || '权益产品'"
                class="product-image"
                @error="handleImageError"
                @load="handleImageLoad"
                loading="lazy"
              />
              <div v-else class="no-image-placeholder">
                <span>暂无图片</span>
              </div>
            </div>

            <div class="product-info">
              <h3>{{ product.productName || '权益产品' }}</h3>
              <p class="product-desc">{{ product.remark || '暂无描述' }}</p>

              <div class="product-price">
                <span class="current-price">Points: {{ product.price || 0 }}</span>
              </div>
              <div class="product-actions">
                <el-button type="primary" size="small" @click.stop="addToCart(product)">
                  加入购物车
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <div v-if="!isLoadingHotProducts && hotProducts.length === 0" class="empty-section">
        <el-empty description="暂无热门产品" />
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h2>推荐权益包</h2>
        <el-button text @click="handleViewMore('packages')">
          查看更多 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoadingPackages" class="loading-section">
        <el-skeleton :rows="3" animated />
      </div>

      <!-- 权益包列表 -->
      <el-row v-else :gutter="20">
        <el-col :span="8" v-for="pkg in recommendedPackages" :key="pkg.id">
          <el-card class="package-card">
            <!-- 权益包图片 -->
            <div class="package-image-container">
              <img
                v-if="pkg.packageImagePath"
                :src="getImageUrl(pkg.packageImagePath)"
                :alt="pkg.packageName || pkg.remark || '权益包'"
                class="package-image"
                @error="handleImageError"
                @load="handleImageLoad"
                loading="lazy"
              />
              <div v-else class="no-image-placeholder">
                <span>暂无图片</span>
              </div>
            </div>

            <div class="package-header">
              <h3>{{ pkg.packageName || pkg.remark || '权益包' }}</h3>
              <el-tag type="primary">推荐</el-tag>
            </div>
            <div class="package-content">
              <p>{{ pkg.remark || '暂无描述' }}</p>
              <div class="package-meta">
                <span class="quantity">库存: {{ pkg.quantity || 0 }}</span>
              </div>
            </div>
            <div class="package-footer">
              <div class="package-price">
                <span class="current-price">Points: {{ pkg.price || 0 }}</span>
              </div>
              <div class="package-actions">
                <el-button type="primary" size="small" @click.stop="addPackageToCart(pkg)">
                  加入购物车
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <div v-if="!isLoadingPackages && recommendedPackages.length === 0" class="empty-section">
        <el-empty description="暂无推荐权益包" />
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h2>限时秒杀</h2>
        <el-button text @click="handleViewMore('flash-sale')">
          查看更多 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <!-- 加载状态 -->
      <div v-if="isLoadingFlashSale" class="loading-section">
        <el-skeleton :rows="3" animated />
      </div>

      <!-- 秒杀活动列表 -->
      <el-row v-else :gutter="20">
        <el-col :span="6" v-for="item in flashSaleItems" :key="item.id">
          <el-card class="flash-sale-card">
            <div class="flash-sale-timer">
              <el-tag type="danger">限时秒杀</el-tag>
              <div class="countdown">
                <span>{{ getRemainingTime(item.endTime) }}</span>
              </div>
            </div>

            <!-- 活动图片 -->
            <div class="flash-sale-image-container">
              <img
                v-if="item.activityImagePath"
                :src="getImageUrl(item.activityImagePath)"
                :alt="item.activityName || '秒杀活动'"
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
              <h3>{{ item.activityName || '秒杀活动' }}</h3>
              <div class="flash-sale-price">
                <span class="current-price">Points: {{ item.price || 0 }}</span>
                <span v-if="item.discountValue" class="discount">{{ item.discountValue }}折</span>
              </div>
              <div class="activity-meta">
                <span class="meta-item">开始: {{ formatTime(item.startTime) }}</span>
                <span class="meta-item">结束: {{ formatTime(item.endTime) }}</span>
              </div>
              <el-button type="danger" size="small" @click.stop="addFlashSaleToCart(item)">
                加入购物车
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 空状态 -->
      <div v-if="!isLoadingFlashSale && flashSaleItems.length === 0" class="empty-section">
        <el-empty description="暂无秒杀活动" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 40px 0 0 0;
}

.banner {
  margin-bottom: 48px;
  border-radius: 12px;
  overflow: hidden;
}

.banner-item {
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  padding: 0 60px;
}

.banner-content {
  color: white;
  max-width: 500px;
}

.banner-content h2 {
  font-size: 36px;
  margin-bottom: 16px;
}

.banner-content p {
  font-size: 18px;
  margin-bottom: 24px;
  opacity: 0.9;
}

.quick-access {
  margin-bottom: 40px;
}

.quick-access-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.quick-access-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.quick-access-icon {
  margin-bottom: 16px;
  color: #409eff;
}

.quick-access-card h3 {
  margin-bottom: 8px;
  color: #303133;
}

.quick-access-card p {
  color: #606266;
  font-size: 14px;
}

.section {
  margin-bottom: 48px;
  padding-left: 8px;
  padding-right: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  color: #303133;
}

.product-card {
  transition: all 0.3s;
  height: 420px;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.image-container {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  margin-bottom: 12px;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-image:hover {
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

.product-info {
  padding: 12px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.product-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
  height: 40px;
  overflow: hidden;
}

.product-price {
  margin-bottom: 12px;
}

.current-price {
  font-size: 18px;
  font-weight: bold;
  color: #f56c6c;
  margin-right: 8px;
}

.original-price {
  font-size: 14px;
  color: #c0c4cc;
  text-decoration: line-through;
}

.product-meta {
  margin-bottom: 12px;
}

.category {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
}

.product-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  justify-content: center;
}

.product-actions .el-button {
  flex: 1;
  max-width: 100px;
}

.loading-section {
  margin: 20px 0;
  padding: 20px;
}

.empty-section {
  margin: 40px 0;
  text-align: center;
}

.package-card {
  transition: all 0.3s;
  height: 380px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.package-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.package-image-container {
  position: relative;
  width: 100%;
  height: 140px;
  overflow: hidden;
  background-color: #f8f9fa;
  margin-bottom: 0;
}

.package-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.package-image:hover {
  transform: scale(1.08);
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  padding: 12px 12px 0 12px;
}

.package-header h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  height: 36px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
  margin-right: 12px;
}

.package-header .el-tag {
  flex-shrink: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 12px;
  padding: 4px 8px;
}

.package-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 12px;
  margin-bottom: 8px;
}

.package-content p {
  color: #606266;
  margin-bottom: 10px;
  font-size: 14px;
  line-height: 1.4;
  height: 32px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.package-meta {
  margin-bottom: 10px;
}

.quantity {
  font-size: 12px;
  color: #606266;
  background: #f0f2f5;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.package-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding: 16px 12px;
  background: #f5f7fa;
  border-top: 1px solid #e4e7ed;
}

.package-actions {
  display: flex;
  gap: 8px;
}

.package-actions .el-button {
  border-radius: 6px;
  font-weight: 600;
  height: 34px;
  padding: 0 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.package-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.flash-sale-card {
  transition: all 0.3s;
  height: 400px;
  display: flex;
  flex-direction: column;
}

.flash-sale-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.flash-sale-timer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.countdown {
  font-size: 14px;
  color: #f56c6c;
  font-weight: bold;
}

.flash-sale-image-container {
  position: relative;
  width: 100%;
  height: 140px;
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
  padding: 0 12px;
}

.flash-sale-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.flash-sale-price {
  margin-bottom: 12px;
}

.discount {
  font-size: 12px;
  color: #f56c6c;
  background: #fef0f0;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
}

.activity-meta {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.meta-item {
  font-size: 12px;
  color: #909399;
  text-align: center;
}

.flash-sale-progress {
  margin-bottom: 12px;
}

.progress-text {
  font-size: 12px;
  color: #909399;
}

/* 确保按钮有足够的空间 */
.flash-sale-info .el-button {
  margin-top: auto;
  width: 100%;
  height: 36px;
  font-weight: 600;
  border-radius: 6px;
}
</style>
