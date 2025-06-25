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
                <el-icon :size="40"><Gift /></el-icon>
              </div>
              <div class="points-content">
                <h3>已兑换</h3>
                <p class="points-number">{{ exchangedCount }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="points-card">
            <div class="points-item">
              <div class="points-icon">
                <el-icon :size="40"><Clock /></el-icon>
              </div>
              <div class="points-content">
                <h3>即将过期</h3>
                <p class="points-number">{{ expiringPoints }}</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="selectedCategory" placeholder="选择分类" clearable>
            <el-option
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="selectedPointsRange" placeholder="积分区间" clearable>
            <el-option
              v-for="range in pointsRanges"
              :key="range.value"
              :label="range.label"
              :value="range.value"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="selectedSort" placeholder="排序方式">
            <el-option label="默认排序" value="default" />
            <el-option label="积分从低到高" value="points-asc" />
            <el-option label="积分从高到低" value="points-desc" />
            <el-option label="兑换人数" value="popular" />
            <el-option label="最新上架" value="newest" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input v-model="searchKeyword" placeholder="搜索商品..." @keyup.enter="handleSearch">
            <template #suffix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </div>

    <!-- 商品列表 -->
    <div class="points-grid">
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in filteredItems" :key="item.id">
          <el-card class="points-item-card">
            <div class="item-badge" v-if="item.badge">
              <el-tag :type="item.badgeType">{{ item.badge }}</el-tag>
            </div>
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="item-desc">{{ item.description }}</p>
              <div class="item-meta">
                <span class="exchange-count">已兑换 {{ item.exchangeCount }}</span>
                <span class="stock-count">库存 {{ item.stockCount }}</span>
              </div>
              <div class="points-required">
                <span class="points-number">{{ item.pointsRequired }}</span>
                <span class="points-label">积分</span>
                <span class="original-price" v-if="item.originalPrice"
                  >价值¥{{ item.originalPrice }}</span
                >
              </div>
              <div class="item-actions">
                <el-button
                  type="primary"
                  size="small"
                  :disabled="item.stockCount === 0 || userPoints < item.pointsRequired"
                  @click="exchangeItem(item)"
                >
                  {{ item.stockCount === 0 ? '已兑完' : '立即兑换' }}
                </el-button>
                <el-button size="small" @click="addToWishlist(item)"> 加入心愿单 </el-button>
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
        :page-sizes="[12, 24, 36, 48]"
        :total="totalItems"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 兑换确认对话框 -->
    <el-dialog v-model="showExchangeDialog" title="确认兑换" width="400px">
      <div class="exchange-confirm">
        <img :src="selectedItem?.image" :alt="selectedItem?.name" class="confirm-image" />
        <h3>{{ selectedItem?.name }}</h3>
        <p>需要消耗 {{ selectedItem?.pointsRequired }} 积分</p>
        <p>当前积分: {{ userPoints }}</p>
        <p>兑换后剩余: {{ userPoints - (selectedItem?.pointsRequired || 0) }}</p>
      </div>
      <template #footer>
        <el-button @click="showExchangeDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmExchange">确认兑换</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const selectedCategory = ref('')
const selectedPointsRange = ref('')
const selectedSort = ref('default')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const totalItems = ref(100)
const showExchangeDialog = ref(false)
const selectedItem = ref<any>(null)

// 用户积分信息
const userPoints = ref(2580)
const exchangedCount = ref(12)
const expiringPoints = ref(500)

// 分类选项
const categories = ref([
  { label: '实物商品', value: 'physical' },
  { label: '虚拟商品', value: 'virtual' },
  { label: '优惠券', value: 'coupon' },
  { label: '会员服务', value: 'vip' },
  { label: '生活服务', value: 'life' },
])

// 积分区间选项
const pointsRanges = ref([
  { label: '0-100积分', value: '0-100' },
  { label: '100-500积分', value: '100-500' },
  { label: '500-1000积分', value: '500-1000' },
  { label: '1000-2000积分', value: '1000-2000' },
  { label: '2000积分以上', value: '2000+' },
])

// 积分商品数据
const pointsItems = ref([
  {
    id: 1,
    name: 'VIP会员月卡',
    description: '享受专属权益和服务',
    image: 'https://via.placeholder.com/300x200/409eff/ffffff?text=VIP会员',
    pointsRequired: 500,
    originalPrice: 29.9,
    exchangeCount: 1234,
    stockCount: 100,
    category: 'vip',
    badge: '热门',
    badgeType: 'danger',
  },
  {
    id: 2,
    name: '流量包5GB',
    description: '全国通用流量包',
    image: 'https://via.placeholder.com/300x200/67c23a/ffffff?text=流量包',
    pointsRequired: 300,
    originalPrice: 19.9,
    exchangeCount: 856,
    stockCount: 50,
    category: 'virtual',
    badge: '新品',
    badgeType: 'success',
  },
  {
    id: 3,
    name: '话费充值50元',
    description: '话费充值立享优惠',
    image: 'https://via.placeholder.com/300x200/e6a23c/ffffff?text=话费充值',
    pointsRequired: 800,
    originalPrice: 50,
    exchangeCount: 567,
    stockCount: 200,
    category: 'virtual',
  },
  {
    id: 4,
    name: '电影票券',
    description: '全国影院通用电影票',
    image: 'https://via.placeholder.com/300x200/f56c6c/ffffff?text=电影票',
    pointsRequired: 400,
    originalPrice: 35,
    exchangeCount: 789,
    stockCount: 150,
    category: 'coupon',
    badge: '限时',
    badgeType: 'warning',
  },
  {
    id: 5,
    name: '咖啡券',
    description: '星巴克咖啡券',
    image: 'https://via.placeholder.com/300x200/909399/ffffff?text=咖啡券',
    pointsRequired: 200,
    originalPrice: 25,
    exchangeCount: 234,
    stockCount: 80,
    category: 'coupon',
  },
  {
    id: 6,
    name: '蓝牙耳机',
    description: '高品质蓝牙耳机',
    image: 'https://via.placeholder.com/300x200/409eff/ffffff?text=蓝牙耳机',
    pointsRequired: 2000,
    originalPrice: 199,
    exchangeCount: 45,
    stockCount: 20,
    category: 'physical',
    badge: '限量',
    badgeType: 'info',
  },
  {
    id: 7,
    name: '外卖优惠券',
    description: '美团外卖优惠券',
    image: 'https://via.placeholder.com/300x200/67c23a/ffffff?text=外卖券',
    pointsRequired: 150,
    originalPrice: 20,
    exchangeCount: 1234,
    stockCount: 300,
    category: 'coupon',
  },
  {
    id: 8,
    name: '打车优惠券',
    description: '滴滴打车优惠券',
    image: 'https://via.placeholder.com/300x200/e6a23c/ffffff?text=打车券',
    pointsRequired: 100,
    originalPrice: 15,
    exchangeCount: 987,
    stockCount: 500,
    category: 'coupon',
  },
])

// 计算属性
const filteredItems = computed(() => {
  let result = [...pointsItems.value]

  // 分类筛选
  if (selectedCategory.value) {
    result = result.filter((item) => item.category === selectedCategory.value)
  }

  // 积分区间筛选
  if (selectedPointsRange.value) {
    const [min, max] = selectedPointsRange.value.split('-').map(Number)
    result = result.filter((item) => {
      if (max) {
        return item.pointsRequired >= min && item.pointsRequired <= max
      } else {
        return item.pointsRequired >= min
      }
    })
  }

  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword),
    )
  }

  // 排序
  switch (selectedSort.value) {
    case 'points-asc':
      result.sort((a, b) => a.pointsRequired - b.pointsRequired)
      break
    case 'points-desc':
      result.sort((a, b) => b.pointsRequired - a.pointsRequired)
      break
    case 'popular':
      result.sort((a, b) => b.exchangeCount - a.exchangeCount)
      break
    case 'newest':
      result.sort((a, b) => b.id - a.id)
      break
  }

  return result
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
  ElMessage.success('搜索完成')
}

const exchangeItem = (item: any) => {
  if (userPoints.value < item.pointsRequired) {
    ElMessage.warning('积分不足，无法兑换')
    return
  }
  if (item.stockCount === 0) {
    ElMessage.warning('商品库存不足')
    return
  }

  selectedItem.value = item
  showExchangeDialog.value = true
}

const confirmExchange = () => {
  if (selectedItem.value) {
    userPoints.value -= selectedItem.value.pointsRequired
    selectedItem.value.stockCount--
    selectedItem.value.exchangeCount++
    exchangedCount.value++

    ElMessage.success(`成功兑换: ${selectedItem.value.name}`)
    showExchangeDialog.value = false
    selectedItem.value = null
  }
}

const addToWishlist = (item: any) => {
  ElMessage.success(`已将 ${item.name} 加入心愿单`)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
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
</style>
