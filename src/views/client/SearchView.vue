<template>
  <div class="search">
    <!-- 搜索头部 -->
    <div class="search-header">
      <div class="search-input-wrapper">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索商品、权益包..."
          size="large"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #suffix>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
          </template>
        </el-input>
      </div>

      <div class="search-filters">
        <el-select v-model="selectedCategory" placeholder="分类" clearable>
          <el-option
            v-for="category in categories"
            :key="category.value"
            :label="category.label"
            :value="category.value"
          />
        </el-select>
        <el-select v-model="selectedPriceRange" placeholder="价格" clearable>
          <el-option
            v-for="range in priceRanges"
            :key="range.value"
            :label="range.label"
            :value="range.value"
          />
        </el-select>
        <el-select v-model="selectedSort" placeholder="排序">
          <el-option label="相关度" value="relevance" />
          <el-option label="价格从低到高" value="price-asc" />
          <el-option label="价格从高到低" value="price-desc" />
          <el-option label="销量优先" value="sales" />
          <el-option label="最新上架" value="newest" />
        </el-select>
      </div>
    </div>

    <!-- 搜索结果统计 -->
    <div class="search-stats">
      <p>找到 {{ totalResults }} 个相关结果</p>
      <p v-if="searchKeyword">搜索关键词："{{ searchKeyword }}"</p>
    </div>

    <!-- 搜索结果 -->
    <div v-if="searchResults.length > 0" class="search-results">
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in searchResults" :key="item.id">
          <el-card class="result-card">
            <div class="item-badge" v-if="item.badge">
              <el-tag :type="item.badgeType">{{ item.badge }}</el-tag>
            </div>
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p class="item-desc">{{ item.description }}</p>
              <div class="item-meta">
                <span class="item-type">{{ item.type === 'product' ? '商品' : '权益包' }}</span>
                <span class="item-sales" v-if="item.salesCount">已售 {{ item.salesCount }}</span>
              </div>
              <div class="item-price">
                <span class="current-price">¥{{ item.currentPrice }}</span>
                <span class="original-price" v-if="item.originalPrice"
                  >¥{{ item.originalPrice }}</span
                >
                <span class="discount" v-if="item.discount">{{ item.discount }}折</span>
              </div>
              <div class="item-actions">
                <el-button type="primary" size="small" @click.stop="addToCart(item)">
                  加入购物车
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 无搜索结果 -->
    <div v-else-if="hasSearched" class="no-results">
      <el-empty description="没有找到相关结果">
        <div class="no-results-suggestions">
          <h3>建议：</h3>
          <ul>
            <li>检查拼写是否正确</li>
            <li>尝试使用更简单的关键词</li>
            <li>尝试使用同义词</li>
            <li>尝试使用更广泛的关键词</li>
          </ul>
        </div>
        <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
      </el-empty>
    </div>

    <!-- 热门搜索 -->
    <div v-if="!hasSearched" class="hot-searches">
      <h2>热门搜索</h2>
      <div class="hot-search-tags">
        <el-tag
          v-for="tag in hotSearchTags"
          :key="tag"
          class="hot-search-tag"
          @click="searchByTag(tag)"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="searchResults.length > 0" class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36, 48]"
        :total="totalResults"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedPriceRange = ref('')
const selectedSort = ref('relevance')
const currentPage = ref(1)
const pageSize = ref(12)
const totalResults = ref(0)
const hasSearched = ref(false)

// 分类选项
const categories = ref([
  { label: 'VIP会员', value: 'vip' },
  { label: '流量包', value: 'data' },
  { label: '话费充值', value: 'phone' },
  { label: '娱乐服务', value: 'entertainment' },
  { label: '生活服务', value: 'life' },
  { label: '权益包', value: 'package' },
])

// 价格区间选项
const priceRanges = ref([
  { label: '0-50元', value: '0-50' },
  { label: '50-100元', value: '50-100' },
  { label: '100-200元', value: '100-200' },
  { label: '200-500元', value: '200-500' },
  { label: '500元以上', value: '500+' },
])

// 热门搜索标签
const hotSearchTags = ref([
  'VIP会员',
  '流量包',
  '话费充值',
  '电影票',
  'KTV',
  '美食券',
  '游戏充值',
  '健身卡',
])

// 搜索结果数据
const searchResults = ref([
  {
    id: 1,
    name: 'VIP会员月卡',
    description: '享受专属权益和服务，包括专属客服、优先处理等',
    image: 'https://via.placeholder.com/300x200/409eff/ffffff?text=VIP会员',
    currentPrice: 29.9,
    originalPrice: 39.9,
    discount: 7.5,
    salesCount: 1234,
    type: 'product',
    category: 'vip',
    badge: '热销',
    badgeType: 'danger',
  },
  {
    id: 2,
    name: '流量包10GB',
    description: '全国通用流量包，有效期30天',
    image: 'https://via.placeholder.com/300x200/67c23a/ffffff?text=流量包',
    currentPrice: 19.9,
    originalPrice: 25.9,
    discount: 7.7,
    salesCount: 856,
    type: 'product',
    category: 'data',
    badge: '新品',
    badgeType: 'success',
  },
  {
    id: 3,
    name: '新人专享包',
    description: '专为新用户打造的权益组合包',
    image: 'https://via.placeholder.com/300x200/409eff/ffffff?text=新人专享包',
    currentPrice: 79.9,
    originalPrice: 129.9,
    discount: 6.1,
    salesCount: 1234,
    type: 'package',
    category: 'package',
    badge: '新人专享',
    badgeType: 'success',
  },
  {
    id: 4,
    name: '话费充值100元',
    description: '话费充值立享优惠，到账快速',
    image: 'https://via.placeholder.com/300x200/e6a23c/ffffff?text=话费充值',
    currentPrice: 95,
    originalPrice: 100,
    discount: 9.5,
    salesCount: 2341,
    type: 'product',
    category: 'phone',
  },
])

// 计算属性
const filteredResults = computed(() => {
  let result = [...searchResults.value]

  // 分类筛选
  if (selectedCategory.value) {
    result = result.filter((item) => item.category === selectedCategory.value)
  }

  // 价格区间筛选
  if (selectedPriceRange.value) {
    const [min, max] = selectedPriceRange.value.split('-').map(Number)
    result = result.filter((item) => {
      if (max) {
        return item.currentPrice >= min && item.currentPrice <= max
      } else {
        return item.currentPrice >= min
      }
    })
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
      result.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0))
      break
    case 'newest':
      result.sort((a, b) => b.id - a.id)
      break
  }

  return result
})

// 方法
const handleSearch = () => {
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  hasSearched.value = true
  currentPage.value = 1
  totalResults.value = filteredResults.value.length
  ElMessage.success(`搜索完成，找到 ${totalResults.value} 个结果`)
}

const searchByTag = (tag: string) => {
  searchKeyword.value = tag
  handleSearch()
}

const addToCart = (item: any) => {
  ElMessage.success(`已将 ${item.name} 加入购物车`)
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 生命周期
onMounted(() => {
  // 从路由参数获取搜索关键词
  const keyword = route.query.keyword as string
  if (keyword) {
    searchKeyword.value = keyword
    handleSearch()
  }
})
</script>

<style scoped>
.search {
  padding: 40px 0 0 0;
}

.search-header {
  margin-bottom: 30px;
}

.search-input-wrapper {
  margin-bottom: 20px;
}

.search-filters {
  display: flex;
  gap: 16px;
}

.search-stats {
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.search-stats p {
  margin: 4px 0;
  color: #606266;
  font-size: 14px;
}

.search-results {
  margin-bottom: 40px;
}

.result-card {
  transition: all 0.3s;
  height: 400px;
  margin-bottom: 20px;
  position: relative;
}

.result-card:hover {
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

.item-type {
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 6px;
  border-radius: 4px;
}

.item-sales {
  font-size: 12px;
  color: #909399;
}

.item-price {
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

.item-actions {
  display: flex;
  gap: 8px;
}

.no-results {
  text-align: center;
  padding: 60px 0;
}

.no-results-suggestions {
  margin: 20px 0;
  text-align: left;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.no-results-suggestions h3 {
  margin: 0 0 12px 0;
  color: #303133;
}

.no-results-suggestions ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
}

.no-results-suggestions li {
  margin-bottom: 8px;
}

.hot-searches {
  text-align: center;
  padding: 60px 0;
}

.hot-searches h2 {
  margin: 0 0 20px 0;
  color: #303133;
}

.hot-search-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.hot-search-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.hot-search-tag:hover {
  transform: scale(1.05);
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
