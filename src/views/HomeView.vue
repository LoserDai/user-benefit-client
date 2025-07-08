<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

interface Banner {
  id: number
  title: string
  description: string
  buttonText: string
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
    buttonText: '立即注册',
    image: '/src/assets/banner_1.png',
  },
  {
    id: 2,
    title: '限时秒杀活动',
    description: '精选商品限时秒杀，错过再等一年',
    buttonText: '立即抢购',
    image: '/src/assets/banner_2.png',
  },
  {
    id: 3,
    title: '积分兑换专区',
    description: '积分兑换好礼，让积分更有价值',
    buttonText: '立即兑换',
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
    icon: 'Coin',
    route: '/points',
  },
])

const hotProducts = ref<Product[]>([
  {
    id: 1,
    name: 'VIP会员月卡',
    description: '享受专属权益和服务',
    image: 'https://picsum.photos/300/300?random=5',
    currentPrice: 29.9,
    originalPrice: 39.9,
  },
  {
    id: 2,
    name: '流量包10GB',
    description: '全国通用流量包',
    image: 'https://via.placeholder.com/300x200/67c23a/ffffff?text=流量包',
    currentPrice: 19.9,
    originalPrice: 25.9,
  },
  {
    id: 3,
    name: '话费充值100元',
    description: '话费充值立享优惠',
    image: 'https://via.placeholder.com/300x200/e6a23c/ffffff?text=话费充值',
    currentPrice: 95,
    originalPrice: 100,
  },
  {
    id: 4,
    name: '电影票券',
    description: '全国影院通用电影票',
    image: 'https://via.placeholder.com/300x200/f56c6c/ffffff?text=电影票',
    currentPrice: 35,
    originalPrice: 45,
  },
])

const recommendedPackages = ref<PackageItem[]>([
  {
    id: 1,
    name: '新人专享包',
    tag: '新人专享',
    tagType: 'success',
    description: '专为新用户打造的权益组合包',
    features: ['VIP会员月卡', '流量包5GB', '话费充值50元'],
    currentPrice: 79.9,
    originalPrice: 129.9,
  },
  {
    id: 2,
    name: '娱乐生活包',
    tag: '热门推荐',
    tagType: 'warning',
    description: '涵盖娱乐生活的全方位权益',
    features: ['电影票券2张', 'KTV欢唱券', '美食优惠券'],
    currentPrice: 99.9,
    originalPrice: 159.9,
  },
  {
    id: 3,
    name: '通讯服务包',
    tag: '限时特惠',
    tagType: 'danger',
    description: '通讯服务一站式解决方案',
    features: ['话费充值100元', '流量包10GB', '短信包100条'],
    currentPrice: 119.9,
    originalPrice: 189.9,
  },
])

const flashSaleItems = ref<FlashSaleItem[]>([
  {
    id: 1,
    name: 'VIP会员年卡',
    image: 'https://via.placeholder.com/300x200/409eff/ffffff?text=VIP年卡',
    currentPrice: 299,
    originalPrice: 399,
    countdown: '02:30:15',
    soldPercentage: 75,
  },
  {
    id: 2,
    name: '流量包20GB',
    image: 'https://via.placeholder.com/300x200/67c23a/ffffff?text=流量包20GB',
    currentPrice: 29.9,
    originalPrice: 49.9,
    countdown: '01:45:30',
    soldPercentage: 60,
  },
  {
    id: 3,
    name: '话费充值200元',
    image: 'https://via.placeholder.com/300x200/e6a23c/ffffff?text=话费200元',
    currentPrice: 180,
    originalPrice: 200,
    countdown: '00:30:45',
    soldPercentage: 85,
  },
  {
    id: 4,
    name: '电影票券5张',
    image: 'https://via.placeholder.com/300x200/f56c6c/ffffff?text=电影票5张',
    currentPrice: 150,
    originalPrice: 225,
    countdown: '03:15:20',
    soldPercentage: 45,
  },
])

const handleBannerClick = (banner: Banner) => {
  ElMessage.success(`点击了: ${banner.title}`)
}

const handleQuickAccess = (item: QuickAccessItem) => {
  router.push(item.route)
}

const handleProductClick = (product: Product) => {
  router.push(`/products/${product.id}`)
}

const addToCart = (product: Product) => {
  ElMessage.success(`已将 ${product.name} 加入购物车`)
}

const handlePackageClick = (pkg: PackageItem) => {
  router.push(`/packages/${pkg.id}`)
}

const buyPackage = (pkg: PackageItem) => {
  ElMessage.success(`正在购买: ${pkg.name}`)
}

const handleFlashSaleClick = (item: FlashSaleItem) => {
  router.push(`/flash-sale/${item.id}`)
}

const buyFlashSale = (item: FlashSaleItem) => {
  ElMessage.success(`正在抢购: ${item.name}`)
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
            <el-button type="primary" size="large" @click="handleBannerClick(banner)">
              {{ banner.buttonText }}
            </el-button>
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
        <h2>热门商品</h2>
        <el-button text @click="$router.push('/products')">
          查看更多 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-row :gutter="20">
        <el-col :span="6" v-for="product in hotProducts" :key="product.id">
          <el-card class="product-card" @click="handleProductClick(product)">
            <img :src="product.image" :alt="product.name" class="product-image" />
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <p class="product-desc">{{ product.description }}</p>
              <div class="product-price">
                <span class="current-price">¥{{ product.currentPrice }}</span>
                <span class="original-price" v-if="product.originalPrice"
                  >¥{{ product.originalPrice }}</span
                >
              </div>
              <el-button type="primary" size="small" @click.stop="addToCart(product)">
                加入购物车
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="section">
      <div class="section-header">
        <h2>推荐权益包</h2>
        <el-button text @click="$router.push('/packages')">
          查看更多 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-row :gutter="20">
        <el-col :span="8" v-for="pkg in recommendedPackages" :key="pkg.id">
          <el-card class="package-card" @click="handlePackageClick(pkg)">
            <div class="package-header">
              <h3>{{ pkg.name }}</h3>
              <el-tag :type="pkg.tagType">{{ pkg.tag }}</el-tag>
            </div>
            <div class="package-content">
              <p>{{ pkg.description }}</p>
              <ul class="package-features">
                <li v-for="feature in pkg.features" :key="feature">{{ feature }}</li>
              </ul>
            </div>
            <div class="package-footer">
              <div class="package-price">
                <span class="current-price">¥{{ pkg.currentPrice }}</span>
                <span class="original-price" v-if="pkg.originalPrice"
                  >¥{{ pkg.originalPrice }}</span
                >
              </div>
              <el-button type="primary" @click.stop="buyPackage(pkg)"> 立即购买 </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div class="section">
      <div class="section-header">
        <h2>限时秒杀</h2>
        <el-button text @click="$router.push('/flash-sale')">
          查看更多 <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in flashSaleItems" :key="item.id">
          <el-card class="flash-sale-card" @click="handleFlashSaleClick(item)">
            <div class="flash-sale-timer">
              <el-tag type="danger">限时秒杀</el-tag>
              <div class="countdown">
                <span>{{ item.countdown }}</span>
              </div>
            </div>
            <img :src="item.image" :alt="item.name" class="flash-sale-image" />
            <div class="flash-sale-info">
              <h3>{{ item.name }}</h3>
              <div class="flash-sale-price">
                <span class="current-price">¥{{ item.currentPrice }}</span>
                <span class="original-price">¥{{ item.originalPrice }}</span>
              </div>
              <div class="flash-sale-progress">
                <el-progress
                  :percentage="item.soldPercentage"
                  :stroke-width="8"
                  :show-text="false"
                />
                <span class="progress-text">已售{{ item.soldPercentage }}%</span>
              </div>
              <el-button type="danger" size="small" @click.stop="buyFlashSale(item)">
                立即抢购
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
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
  cursor: pointer;
  transition: all 0.3s;
  height: 320px;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.product-info {
  padding: 12px 0;
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

.package-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 280px;
  display: flex;
  flex-direction: column;
}

.package-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.package-header h3 {
  margin: 0;
  color: #303133;
}

.package-content {
  flex: 1;
}

.package-content p {
  color: #606266;
  margin-bottom: 12px;
}

.package-features {
  list-style: none;
  padding: 0;
  margin: 0;
}

.package-features li {
  color: #606266;
  font-size: 14px;
  margin-bottom: 4px;
  padding-left: 16px;
  position: relative;
}

.package-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #67c23a;
}

.package-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.flash-sale-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 320px;
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

.flash-sale-image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 12px;
}

.flash-sale-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.flash-sale-price {
  margin-bottom: 12px;
}

.flash-sale-progress {
  margin-bottom: 12px;
}

.progress-text {
  font-size: 12px;
  color: #909399;
}
</style>
