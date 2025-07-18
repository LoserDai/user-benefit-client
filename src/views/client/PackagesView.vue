<template>
  <div class="packages">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>权益包</h1>
      <p>精选权益组合包，让您的权益更有价值</p>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-select v-model="selectedType" placeholder="选择类型" clearable>
            <el-option
              v-for="type in packageTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
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
          <el-input v-model="searchKeyword" placeholder="搜索权益包..." @keyup.enter="handleSearch">
            <template #suffix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
    </div>

    <!-- 权益包列表 -->
    <div class="packages-grid">
      <el-row :gutter="20">
        <el-col :span="8" v-for="pkg in filteredPackages" :key="pkg.id">
          <el-card class="pkg-card" @click="handlePackageClick(pkg)">
            <div class="pkg-header">
              <h3>{{ pkg.name }}</h3>
              <el-tag :type="pkg.tagType">{{ pkg.tag }}</el-tag>
            </div>
            <div class="pkg-image">
              <img :src="pkg.image" :alt="pkg.name" />
            </div>
            <div class="pkg-content">
              <p class="pkg-desc">{{ pkg.description }}</p>
              <div class="pkg-features">
                <h4>包含权益：</h4>
                <ul>
                  <li v-for="feature in pkg.features" :key="feature">{{ feature }}</li>
                </ul>
              </div>
              <div class="pkg-meta">
                <span class="sales-count">已售 {{ pkg.salesCount }}</span>
                <span class="rating">
                  <el-rate v-model="pkg.rating" disabled show-score text-color="#ff9900" />
                </span>
              </div>
            </div>
            <div class="pkg-footer">
              <div class="pkg-price">
                <span class="current-price">¥{{ pkg.currentPrice }}</span>
                <span class="original-price" v-if="pkg.originalPrice"
                  >¥{{ pkg.originalPrice }}</span
                >
                <span class="discount" v-if="pkg.discount">{{ pkg.discount }}折</span>
              </div>
              <div class="pkg-actions">
                <el-button type="primary" @click.stop="buyPackage(pkg)"> 立即购买 </el-button>
                <el-button @click.stop="addToCart(pkg)"> 加入购物车 </el-button>
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
        :page-sizes="[9, 18, 27, 36]"
        :total="totalPackages"
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
const selectedType = ref('')
const selectedPriceRange = ref('')
const selectedSort = ref('default')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(9)
const totalPackages = ref(50)

// 权益包类型选项
const packageTypes = ref([
  { label: '新人专享', value: 'newbie' },
  { label: '娱乐生活', value: 'entertainment' },
  { label: '通讯服务', value: 'communication' },
  { label: '生活服务', value: 'life' },
  { label: '商务办公', value: 'business' },
])

// 价格区间选项
const priceRanges = ref([
  { label: '0-100元', value: '0-100' },
  { label: '100-200元', value: '100-200' },
  { label: '200-500元', value: '200-500' },
  { label: '500-1000元', value: '500-1000' },
  { label: '1000元以上', value: '1000+' },
])

// 权益包数据
const packages = ref([
  {
    id: 1,
    name: '新人专享包',
    tag: '新人专享',
    tagType: 'success',
    description: '专为新用户打造的权益组合包，包含多种实用权益',
    image: 'https://via.placeholder.com/400x250/409eff/ffffff?text=新人专享包',
    features: ['VIP会员月卡', '流量包5GB', '话费充值50元', '电影票券1张'],
    currentPrice: 79.9,
    originalPrice: 129.9,
    discount: 6.1,
    salesCount: 1234,
    rating: 4.5,
    type: 'newbie',
  },
  {
    id: 2,
    name: '娱乐生活包',
    tag: '热门推荐',
    tagType: 'warning',
    description: '涵盖娱乐生活的全方位权益，让生活更加丰富多彩',
    image: 'https://via.placeholder.com/400x250/67c23a/ffffff?text=娱乐生活包',
    features: ['电影票券2张', 'KTV欢唱券', '美食优惠券', '游戏充值券'],
    currentPrice: 99.9,
    originalPrice: 159.9,
    discount: 6.2,
    salesCount: 856,
    rating: 4.3,
    type: 'entertainment',
  },
  {
    id: 3,
    name: '通讯服务包',
    tag: '限时特惠',
    tagType: 'danger',
    description: '通讯服务一站式解决方案，满足您的通讯需求',
    image: 'https://via.placeholder.com/400x250/e6a23c/ffffff?text=通讯服务包',
    features: ['话费充值100元', '流量包10GB', '短信包100条', '来电显示'],
    currentPrice: 119.9,
    originalPrice: 189.9,
    discount: 6.3,
    salesCount: 567,
    rating: 4.2,
    type: 'communication',
  },
  {
    id: 4,
    name: '生活服务包',
    tag: '生活必备',
    tagType: 'info',
    description: '日常生活服务权益包，让生活更加便利',
    image: 'https://via.placeholder.com/400x250/909399/ffffff?text=生活服务包',
    features: ['外卖优惠券', '打车优惠券', '快递优惠券', '家政服务券'],
    currentPrice: 89.9,
    originalPrice: 139.9,
    discount: 6.4,
    salesCount: 789,
    rating: 4.4,
    type: 'life',
  },
  {
    id: 5,
    name: '商务办公包',
    tag: '商务专享',
    tagType: 'primary',
    description: '专为商务人士打造的办公服务权益包',
    image: 'https://via.placeholder.com/400x250/409eff/ffffff?text=商务办公包',
    features: ['云存储服务', '办公软件会员', '会议服务券', '打印服务券'],
    currentPrice: 199.9,
    originalPrice: 299.9,
    discount: 6.7,
    salesCount: 234,
    rating: 4.6,
    type: 'business',
  },
  {
    id: 6,
    name: '学生专享包',
    tag: '学生专享',
    tagType: 'success',
    description: '专为学生群体设计的优惠权益包',
    image: 'https://via.placeholder.com/400x250/67c23a/ffffff?text=学生专享包',
    features: ['学生认证优惠', '学习软件会员', '图书馆服务', '考试资料'],
    currentPrice: 59.9,
    originalPrice: 99.9,
    discount: 6.0,
    salesCount: 1456,
    rating: 4.7,
    type: 'newbie',
  },
])

// 计算属性
const filteredPackages = computed(() => {
  let result = [...packages.value]

  // 类型筛选
  if (selectedType.value) {
    result = result.filter((pkg) => pkg.type === selectedType.value)
  }

  // 价格区间筛选
  if (selectedPriceRange.value) {
    const [min, max] = selectedPriceRange.value.split('-').map(Number)
    result = result.filter((pkg) => {
      if (max) {
        return pkg.currentPrice >= min && pkg.currentPrice <= max
      } else {
        return pkg.currentPrice >= min
      }
    })
  }

  // 搜索筛选
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (pkg) =>
        pkg.name.toLowerCase().includes(keyword) || pkg.description.toLowerCase().includes(keyword),
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

const handlePackageClick = (pkg: any) => {
  router.push(`/packages/${pkg.id}`)
}

const buyPackage = (pkg: any) => {
  ElMessage.success(`正在购买: ${pkg.name}`)
}

const addToCart = (pkg: any) => {
  ElMessage.success(`已将 ${pkg.name} 加入购物车`)
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
.packages {
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

.packages-grid {
  margin-bottom: 40px;
}

.pkg-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 500px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.pkg-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.pkg-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pkg-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.pkg-image {
  margin-bottom: 16px;
}

.pkg-image img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.pkg-content {
  flex: 1;
}

.pkg-desc {
  color: #606266;
  margin-bottom: 16px;
  height: 40px;
  overflow: hidden;
}

.pkg-features {
  margin-bottom: 16px;
}

.pkg-features h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
}

.pkg-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pkg-features li {
  color: #606266;
  font-size: 12px;
  margin-bottom: 4px;
  padding-left: 16px;
  position: relative;
}

.pkg-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #67c23a;
}

.pkg-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.sales-count {
  font-size: 12px;
  color: #909399;
}

.rating {
  display: flex;
  align-items: center;
}

.pkg-footer {
  margin-top: auto;
}

.pkg-price {
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

.pkg-actions {
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
