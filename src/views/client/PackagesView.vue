<template>
  <div class="packages">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>权益包</h1>
      <p>精选各类权益包，满足您的多样化需求</p>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索权益包..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="8">
          <el-select v-model="selectedPriceRange" placeholder="价格区间" clearable>
            <el-option
              v-for="range in priceRanges"
              :key="range.value"
              :label="range.label"
              :value="range.value"
            />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-select v-model="selectedSort" placeholder="排序方式" clearable>
            <el-option label="默认排序" value="default" />
            <el-option label="价格从低到高" value="price-asc" />
            <el-option label="价格从高到低" value="price-desc" />
            <el-option label="数量优先" value="quantity" />
            <el-option label="最新上架" value="newest" />
          </el-select>
        </el-col>
      </el-row>
    </div>

    <!-- 权益包列表 -->
    <div class="packages-grid">
      <el-row :gutter="20" :justify="filteredPackages.length === 1 ? 'center' : 'start'">
        <el-col
          v-for="packageItem in filteredPackages"
          :key="packageItem.id"
          :span="filteredPackages.length === 1 ? 8 : 6"
        >
          <el-card class="package-card" @click="handlePackageClick(packageItem)">
            <!-- 权益包图片 -->
            <div class="image-container">
              <img
                v-if="packageItem.packageImagePath"
                :src="getImageUrl(packageItem.packageImagePath)"
                :alt="packageItem.remark || '权益包'"
                class="package-image"
                @error="handleImageError"
                @load="handleImageLoad"
                loading="lazy"
              />
              <div v-else class="no-image-placeholder">
                <span>暂无图片</span>
              </div>
            </div>

            <div class="package-info">
              <h3>{{ packageItem.remark || '权益包' }}</h3>
              <p class="package-desc">{{ packageItem.remark || '暂无描述' }}</p>
              <div class="package-meta">
                <span class="quantity">数量: {{ packageItem.quantity || 0 }}</span>
              </div>
              <div class="package-price">
                <span class="current-price">¥{{ packageItem.price || 0 }}</span>
              </div>
              <div class="package-actions">
                <el-button type="primary" size="small" @click.stop="addToCart(packageItem)">
                  加入购物车
                </el-button>
                <el-button type="danger" size="small" @click.stop="buyNow(packageItem)">
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
        :total="totalPackages"
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
import { packageApi } from '@/api/user'
import { BACKEND_CONFIG } from '@/config/backend'

const router = useRouter()

// 响应式数据
const selectedPriceRange = ref('')
const selectedSort = ref('default')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const totalPackages = ref(0)

// 价格区间选项
const priceRanges = ref([
  { label: '0-50元', value: '0-50' },
  { label: '50-100元', value: '50-100' },
  { label: '100-200元', value: '100-200' },
  { label: '200-500元', value: '200-500' },
  { label: '500元以上', value: '500+' },
])

// 权益包数据
const packages = ref<any[]>([])

// 获取权益包列表
const isLoading = ref(false)

const fetchPackages = async () => {
  // 防止重复请求
  if (isLoading.value) return
  isLoading.value = true

  const params: any = {
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    status: 'ACTIVE',
  }

  // 价格区间
  if (selectedPriceRange.value) {
    const [min, max] = selectedPriceRange.value.split('-')
    params.price = Number(min)
    if (max && max !== '+') {
      // 这里可以根据需要调整价格筛选逻辑
    }
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
      case 'quantity':
        params.sortField = 'quantity'
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
    params.remark = searchKeyword.value
  }

  try {
    const res = await packageApi.queryPackage(params)
    console.log('权益包API响应:', res)
    packages.value = res.data?.data || []
    totalPackages.value = res.data?.total || 0
    console.log('处理后的权益包数据:', packages.value)
    console.log('总数:', totalPackages.value)
  } catch (e) {
    console.error('获取权益包失败:', e)
    ElMessage.error('获取权益包失败')
  } finally {
    isLoading.value = false
  }
}

// 监听筛选、分页、排序、搜索变化自动请求
watch(
  [selectedPriceRange, selectedSort, searchKeyword, currentPage, pageSize],
  () => {
    // 避免在组件初始化时重复调用
    if (packages.value.length > 0 || currentPage.value > 1) {
      fetchPackages()
    }
  },
  { immediate: false },
)

// 组件初始化标记
const isInitialized = ref(false)

onMounted(() => {
  if (!isInitialized.value) {
    fetchPackages()
    isInitialized.value = true
  }
})

// 计算属性
const filteredPackages = computed(() => {
  return packages.value
})

// 方法
const handleSearch = () => {
  currentPage.value = 1
  ElMessage.success('搜索完成')
}

const handlePackageClick = (packageItem: any) => {
  router.push(`/packages/${packageItem.id}`)
}

const addToCart = (packageItem: any) => {
  ElMessage.success(`已将 ${packageItem.remark || '权益包'} 加入购物车`)
}

const buyNow = (packageItem: any) => {
  ElMessage.success(`正在购买: ${packageItem.remark || '权益包'}`)
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

.package-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 400px;
  width: 100%;
  margin-bottom: 20px;
  position: relative;
}

.image-container {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
}

.package-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.package-image:hover {
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

.package-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.package-info {
  padding: 20px;
}

.package-info h3 {
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #303133;
  height: 50px;
  overflow: hidden;
}

.package-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 16px;
  height: 40px;
  overflow: hidden;
}

.package-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.quantity {
  font-size: 14px;
  color: #909399;
}

.package-price {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
}

.package-actions {
  display: flex;
  gap: 8px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
</style>
