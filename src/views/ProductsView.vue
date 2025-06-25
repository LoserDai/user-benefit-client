<template>
  <div class="products">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>权益产品</h1>
      <p>精选各类权益产品，满足您的多样化需求</p>
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
          <el-select v-model="selectedPriceRange" placeholder="价格区间" clearable>
            <el-option
              v-for="range in priceRanges"
              :key="range.value"
              :label="range.label"
              :value="range.value"
            />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="selectedSort" placeholder="排序方式">
            <el-option label="默认排序" value="default" />
            <el-option label="价格从低到高" value="price-asc" />
            <el-option label="价格从高到低" value="price-desc" />
            <el-option label="销量优先" value="sales" />
            <el-option label="最新上架" value="newest" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input v-model="searchKeyword" placeholder="搜索产品..." @keyup.enter="handleSearch">
            <template #suffix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </div>

    <!-- 产品列表 -->
    <div class="products-grid">
      <el-row :gutter="20">
        <el-col :span="6" v-for="product in filteredProducts" :key="product.id">
          <el-card class="product-card" @click="handleProductClick(product)">
            <div class="product-badge" v-if="product.badge">
              <el-tag :type="product.badgeType">{{ product.badge }}</el-tag>
            </div>
            <img :src="product.image" :alt="product.name" class="product-image" />
            <div class="product-info">
              <h3>{{ product.name }}</h3>
              <p class="product-desc">{{ product.description }}</p>
              <div class="product-meta">
                <span class="sales-count">已售 {{ product.salesCount }}</span>
                <span class="rating">
                  <el-rate v-model="product.rating" disabled show-score text-color="#ff9900" />
                </span>
              </div>
              <div class="product-price">
                <span class="current-price">¥{{ product.currentPrice }}</span>
                <span class="original-price" v-if="product.originalPrice"
                  >¥{{ product.originalPrice }}</span
                >
                <span class="discount" v-if="product.discount">{{ product.discount }}折</span>
              </div>
              <div class="product-actions">
                <el-button type="primary" size="small" @click.stop="addToCart(product)">
                  加入购物车
                </el-button>
                <el-button type="danger" size="small" @click.stop="buyNow(product)">
                  立即购买
                </el-button>
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
        :total="totalProducts"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 响应式数据
const selectedCategory = ref('')
const selectedPriceRange = ref('')
const selectedSort = ref('default')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const totalProducts = ref(100)

// 分类选项
const categories = ref([
  { label: 'VIP会员', value: 'vip' },
  { label: '流量包', value: 'data' },
  { label: '话费充值', value: 'phone' },
  { label: '娱乐服务', value: 'entertainment' },
  { label: '生活服务', value: 'life' },
])

// 价格区间选项
const priceRanges = ref([
  { label: '0-50元', value: '0-50' },
  { label: '50-100元', value: '50-100' },
  { label: '100-200元', value: '100-200' },
  { label: '200-500元', value: '200-500' },
  { label: '500元以上', value: '500+' },
])

// 产品数据
const products = ref([
  {
    id: 1,
    name: 'VIP会员月卡',
    description: '享受专属权益和服务，包括专属客服、优先处理等',
    image: 'https://via.placeholder.com/300x200/409eff/ffffff?text=VIP会员',
    currentPrice: 29.9,
    originalPrice: 39.9,
    discount: 7.5,
    salesCount: 1234,
    rating: 4.5,
    category: 'vip',
    badge: '热销',
    badgeType: 'danger',
  },
  {
    id: 2,
    name: '流量包10GB',
    description: '全国通用流量包，有效期30天',
    image: 'https://picsum.photos/400/300?random=8',
    currentPrice: 19.9,
    originalPrice: 25.9,
    discount: 7.7,
    salesCount: 856,
    rating: 4.3,
    category: 'data',
    badge: '新品',
    badgeType: 'success',
  },
  {
    id: 3,
    name: '话费充值100元',
    description: '话费充值立享优惠，到账快速',
    image: 'https://via.placeholder.com/300x200/e6a23c/ffffff?text=话费充值',
    currentPrice: 95,
    originalPrice: 100,
    discount: 9.5,
    salesCount: 2341,
    rating: 4.7,
    category: 'phone',
  },
  {
    id: 4,
    name: '电影票券',
    description: '全国影院通用电影票，支持在线选座',
    image: 'https://via.placeholder.com/300x200/f56c6c/ffffff?text=电影票',
    currentPrice: 35,
    originalPrice: 45,
    discount: 7.8,
    salesCount: 567,
    rating: 4.2,
    category: 'entertainment',
    badge: '限时',
    badgeType: 'warning',
  },
  {
    id: 5,
    name: 'KTV欢唱券',
    description: '全国连锁KTV通用，支持在线预约',
    image: 'https://via.placeholder.com/300x200/909399/ffffff?text=KTV券',
    currentPrice: 88,
    originalPrice: 128,
    discount: 6.9,
    salesCount: 234,
    rating: 4.1,
    category: 'entertainment',
  },
  {
    id: 6,
    name: '美食优惠券',
    description: '全国知名餐厅通用优惠券',
    image: 'https://via.placeholder.com/300x200/67c23a/ffffff?text=美食券',
    currentPrice: 50,
    originalPrice: 80,
    discount: 6.3,
    salesCount: 789,
    rating: 4.4,
    category: 'life',
  },
  {
    id: 7,
    name: 'VIP会员年卡',
    description: '年度VIP会员，享受全年专属服务',
    image: 'https://via.placeholder.com/300x200/409eff/ffffff?text=VIP年卡',
    currentPrice: 299,
    originalPrice: 399,
    discount: 7.5,
    salesCount: 456,
    rating: 4.6,
    category: 'vip',
    badge: '推荐',
    badgeType: 'primary',
  },
  {
    id: 8,
    name: '流量包20GB',
    description: '大容量流量包，适合重度用户',
    image: 'https://via.placeholder.com/300x200/67c23a/ffffff?text=流量包20GB',
    currentPrice: 39.9,
    originalPrice: 49.9,
    discount: 8.0,
    salesCount: 678,
    rating: 4.3,
    category: 'data',
  },
])

// 计算属性
const filteredProducts = computed(() => {
  let result = [...products.value]

  // 分类筛选
  if (selectedCategory.value) {
    result = result.filter((product) => product.category === selectedCategory.value)
  }

  // 价格区间筛选
  if (selectedPriceRange.value) {
    const [min, max] = selectedPriceRange.value.split('-').map(Number)
    result = result.filter((product) => {
      if (max) {
        return product.currentPrice >= min && product.currentPrice <= max
      } else {
        return product.currentPrice >= min
      }
    })
  }

  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword),
    )
  }

  // 排序
  switch (selectedSort.value) {
    case 'price-asc':
      result.sort((a, b) => a.currentPrice - b.currentPrice)
      break
    case 'price-desc':
      result.sort((a, b) => b.currentPrice - a.currentPrice)
      break
    case 'sales':
      result.sort((a, b) => b.salesCount - a.salesCount)
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

const handleProductClick = (product: any) => {
  router.push(`/products/${product.id}`)
}

const addToCart = (product: any) => {
  ElMessage.success(`已将 ${product.name} 加入购物车`)
}

const buyNow = (product: any) => {
  ElMessage.success(`正在购买: ${product.name}`)
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
.products {
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
}

.products-grid {
  margin-bottom: 40px;
}

.product-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 400px;
  width: 100%;
  margin-bottom: 20px;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.product-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
}

.product-image {
  width: 100%;
  height: 180px;
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
  height: 40px;
  overflow: hidden;
}

.product-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
  height: 40px;
  overflow: hidden;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sales-count {
  font-size: 12px;
  color: #909399;
}

.rating {
  display: flex;
  align-items: center;
}

.product-price {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-price {
  font-size: 18px;
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

.product-actions {
  display: flex;
  gap: 8px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.section {
  margin-bottom: 48px;
  padding-left: 8px;
  padding-right: 8px;
}
</style>
