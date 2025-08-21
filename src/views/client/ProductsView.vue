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
          <el-select v-model="selectedCategory" placeholder="选择分类" clearable disabled>
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
          <el-select v-model="selectedSort" placeholder="排序方式" clearable>
            <el-option label="默认排序" value="default" />
            <el-option label="价格从低到高" value="price-asc" />
            <el-option label="价格从高到低" value="price-desc" />
            <el-option label="销量优先" value="sales" />
            <el-option label="最新上架" value="newest" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索产品..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </div>

    <!-- 产品列表 -->
    <div class="products-grid">
      <el-row :gutter="20" :justify="filteredProducts.length === 1 ? 'center' : 'start'">
        <el-col
          v-for="product in filteredProducts"
          :key="product.id"
          :span="filteredProducts.length === 1 ? 8 : 6"
        >
          <el-card class="product-card" @click="handleProductClick(product)">
            <!-- 产品角标可根据需要自定义，这里暂不显示 -->
            <!-- <div class="product-badge" v-if="product.badge">
              <el-tag :type="product.badgeType">{{ product.badge }}</el-tag>
            </div> -->
            <div class="image-container">
              <img
                v-if="product.productImagePath"
                :src="getImageUrl(product.productImagePath)"
                :alt="product.productName"
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
              <h3>{{ product.productName }}</h3>
              <p class="product-desc">{{ product.remark || '暂无描述' }}</p>
              <div class="product-meta">
                <!-- 已售和星级评分已移除 -->
              </div>
              <div class="product-price">
                <span class="current-price">¥{{ product.price }}</span>
                <!-- 无原价、折扣等字段，隐藏 -->
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { productApi } from '@/api/user'
import { BACKEND_CONFIG } from '@/config/backend'

const router = useRouter()

// 响应式数据
const selectedCategory = ref('')
const selectedPriceRange = ref('')
const selectedSort = ref('default')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const totalProducts = ref(0)

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
const products = ref<any[]>([])

// 获取产品列表
const isLoading = ref(false)

const fetchProducts = async () => {
  // 防止重复请求
  if (isLoading.value) return
  isLoading.value = true

  const params: any = {
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    status: 'ACTIVE',
  }
  // 分类
  if (selectedCategory.value) {
    params.category = selectedCategory.value
  }
  // 价格区间
  if (selectedPriceRange.value) {
    const [min, max] = selectedPriceRange.value.split('-')
    params.minPrice = Number(min)
    if (max && max !== '+') params.maxPrice = Number(max)
  }
  // 排序
  if (selectedSort.value && selectedSort.value !== 'default') {
    switch (selectedSort.value) {
      case 'price-asc':
        params.sortField = 'price'
        params.sortOrder = 'asc'
        break
      case 'price-desc':
        params.sortField = 'price'
        params.sortOrder = 'desc'
        break
      case 'sales':
        params.sortField = 'salesCount'
        params.sortOrder = 'desc'
        break
      case 'newest':
        params.sortField = 'id'
        params.sortOrder = 'desc'
        break
    }
  }
  // 搜索
  if (searchKeyword.value) {
    params.productName = searchKeyword.value
  }
  try {
    const res = await productApi.queryAllProduct(params)
    console.log('API响应:', res)
    products.value = res.data?.data || []
    totalProducts.value = res.data?.total || 0
    console.log('处理后的产品数据:', products.value)
    console.log('总数:', totalProducts.value)

    // 调试图片路径
    products.value.forEach((product, index) => {
      console.log(`产品 ${index + 1}:`, {
        id: product.id,
        name: product.productName,
        imagePath: product.productImagePath,
        fullImageUrl: getImageUrl(product.productImagePath),
      })
    })
  } catch (e) {
    console.error('获取产品失败:', e)
    ElMessage.error('获取产品失败')
  } finally {
    isLoading.value = false
  }
}

// 监听筛选、分页、排序、搜索变化自动请求
watch(
  [selectedCategory, selectedPriceRange, selectedSort, searchKeyword, currentPage, pageSize],
  () => {
    // 避免在组件初始化时重复调用
    if (products.value.length > 0 || currentPage.value > 1) {
      fetchProducts()
    }
  },
  { immediate: false },
)

// 组件初始化标记
const isInitialized = ref(false)

onMounted(() => {
  if (!isInitialized.value) {
    fetchProducts()
    isInitialized.value = true
  }
})

// 计算属性
const filteredProducts = computed(() => {
  // 暂时禁用分类筛选，因为后端数据中没有category字段
  // TODO: 后续可以根据产品名称或其他字段来实现分类筛选
  return products.value
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
  ElMessage.success(`已将 ${product.productName} 加入购物车`)
}

const buyNow = (product: any) => {
  ElMessage.success(`正在购买: ${product.productName}`)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 图片URL处理 - 使用配置文件
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

.image-container {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
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
