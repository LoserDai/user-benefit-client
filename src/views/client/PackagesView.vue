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
        <el-col :span="12">
          <el-input
            v-model="searchPackageName"
            placeholder="搜索权益包名称..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="12">
          <el-input
            v-model="searchQuantity"
            placeholder="筛选库存数量..."
            type="number"
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>库存</template>
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

    <!-- 权益包列表 -->
    <div class="packages-grid">
      <el-row :gutter="20" :justify="filteredPackages.length === 1 ? 'center' : 'start'">
        <el-col
          v-for="packageItem in filteredPackages"
          :key="packageItem.id"
          :span="filteredPackages.length === 1 ? 8 : 6"
        >
          <el-card class="package-card">
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
              <h3 class="package-title">{{ packageItem.packageName || '权益包' }}</h3>
              <p class="package-desc">{{ packageItem.remark || '暂无描述' }}</p>

              <div class="package-meta">
                <span class="quantity">库存: {{ packageItem.quantity || 0 }}</span>
              </div>

              <div class="package-price">
                <span class="current-price">Points: {{ packageItem.price || 0 }}</span>
              </div>

              <div class="package-actions">
                <el-button type="primary" size="small" @click.stop="addToCart(packageItem)">
                  加入购物车
                </el-button>
              </div>
              <!-- 调试信息 -->
              <div style="font-size: 10px; color: #999; text-align: center; margin-top: 8px">
                ID: {{ packageItem.id }} | 库存: {{ packageItem.quantity }} | 价格:
                {{ packageItem.price }}
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
const searchPackageName = ref('')
const searchQuantity = ref('')
const currentPage = ref(1)
const pageSize = ref(12)
const totalPackages = ref(0)

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

  // 权益包名称搜索
  if (searchPackageName.value && searchPackageName.value.trim() !== '') {
    params.packageName = searchPackageName.value.trim()
  }

  // 库存筛选
  if (searchQuantity.value && searchQuantity.value.trim() !== '') {
    params.quantity = Number(searchQuantity.value)
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

// 监听分页变化自动请求
watch(
  [currentPage, pageSize],
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
  fetchPackages()
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  // 重置所有筛选条件
  searchPackageName.value = ''
  searchQuantity.value = ''
  currentPage.value = 1

  // 重新获取数据
  fetchPackages()
  ElMessage.success('筛选条件已重置')
}

const addToCart = (packageItem: any) => {
  ElMessage.success(`已将 ${packageItem.remark || '权益包'} 加入购物车`)
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
  border: 1px solid #e4e7ed;
}

.filter-section .el-row {
  margin-bottom: 0;
}

.filter-section .el-col {
  margin-bottom: 10px;
}

.filter-section .el-button {
  margin-right: 10px;
}

.packages-grid {
  margin-bottom: 40px;
}

.package-card {
  transition: all 0.3s;
  min-height: 450px;
  width: 100%;
  margin-bottom: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
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
  padding: 12px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.package-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
  height: 40px;
  overflow: hidden;
  line-height: 1.4;
  font-weight: 600;
}

.package-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
  height: 40px;
  overflow: hidden;
  line-height: 1.5;
}

.package-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.quantity {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.package-price {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;
}

.current-price {
  font-size: 20px;
  font-weight: bold;
  color: #f56c6c;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.package-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
  justify-content: center;
}

.package-actions .el-button {
  flex: 1;
  max-width: 120px;
  height: 36px;
  font-weight: 500;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.package-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}
</style>
