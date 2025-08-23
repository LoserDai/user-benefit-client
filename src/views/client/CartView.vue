<template>
  <div class="cart">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>购物车</h1>
      <p>管理您的购物清单</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 空购物车状态 -->
    <div v-else-if="!cartData || cartData.length === 0" class="empty-cart">
      <el-empty description="购物车是空的">
        <el-button type="primary" @click="$router.push('/')">去购物</el-button>
      </el-empty>
    </div>

    <!-- 购物车内容 -->
    <div v-else class="cart-content">
      <!-- 购物车商品列表 -->
      <div class="cart-items">
        <el-card>
          <template #header>
            <div class="cart-header">
              <el-checkbox v-model="selectAll" @change="handleSelectAll"> 全选 </el-checkbox>
              <span class="item-count">共 {{ cartData.length }} 件商品</span>
            </div>
          </template>

          <div class="cart-item" v-for="item in cartData" :key="item.id">
            <el-checkbox v-model="item.selected" @change="updateSelectAll" />
            <img :src="getImageUrl(item.item_image)" :alt="item.item_name" class="item-image" />
            <div class="item-info">
              <h3>{{ item.item_name }}</h3>
              <div class="item-tags">
                <el-tag :type="getItemTypeTagType(item.item_type)" size="small">
                  {{ getItemTypeText(item.item_type) }}
                </el-tag>
              </div>
            </div>
            <div class="item-price">
              <span class="current-price">{{ item.point_price }} Points</span>
            </div>
            <div class="item-quantity">
              <span class="quantity-display">{{ item.quantity }}</span>
            </div>
            <div class="item-total">{{ item.point_price * item.quantity }} Points</div>
            <div class="item-actions">
              <el-button type="danger" size="small" @click="removeItem(item)"> 删除 </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 购物车结算 -->
      <div class="cart-summary">
        <el-card>
          <div class="summary-content">
            <div class="summary-item">
              <span>商品总Points：</span>
              <span class="price">{{ totalSelectedPoints }} Points</span>
            </div>
            <div class="summary-item">
              <span>选中商品：</span>
              <span class="count">{{ selectedCount }} 件</span>
            </div>
            <el-divider />
            <div class="summary-item total">
              <span>结算Points：</span>
              <span class="final-price">{{ totalSelectedPoints }} Points</span>
            </div>
            <div class="summary-actions">
              <el-button
                type="primary"
                size="large"
                :disabled="selectedCount === 0"
                @click="checkout"
              >
                结算 ({{ selectedCount }})
              </el-button>
              <el-button size="large" @click="clearCart"> 清空购物车 </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 推荐商品 -->
    <div class="recommendations">
      <h2>为您推荐</h2>
      <div v-if="isLoadingRecommendations" class="loading-recommendations">
        <el-skeleton :rows="2" animated />
      </div>
      <el-row v-else :gutter="20">
        <el-col :span="6" v-for="item in recommendedItems" :key="item.id">
          <el-card class="recommendation-card">
            <img
              :src="getImageUrl(item.productImagePath)"
              :alt="item.productName"
              class="recommendation-image"
            />
            <div class="recommendation-info">
              <h3>{{ item.productName }}</h3>
              <p>{{ item.description || '暂无描述' }}</p>
              <div class="recommendation-price">
                <span class="current-price">Points: {{ item.price || 0 }}</span>
              </div>
              <div class="recommendation-actions">
                <el-button type="primary" size="small" @click.stop="addToCart(item)">
                  加入购物车
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '@/api/user'
import { productApi } from '@/api/user'
import { BACKEND_CONFIG } from '@/config/backend'

const router = useRouter()

// 用户信息
const currentUser = ref<any>(null)
const isLoadingUser = ref(false)

// 获取当前用户信息
const fetchCurrentUser = async () => {
  if (isLoadingUser.value) return
  isLoadingUser.value = true

  try {
    const response = await userApi.getCurrentUser()
    if (response && response.data) {
      currentUser.value = response.data
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  } finally {
    isLoadingUser.value = false
  }
}

// 响应式数据
const selectAll = ref(false)
const isLoading = ref(false)

// 购物车数据结构
interface CartItem {
  id: number
  user_id: number
  quantity: number
  create_time: string
  total_selected_points: number
  item_type: number
  item_image: string
  item_name: string
  point_price: number
  selected: boolean
}

// 购物车数据
const cartData = ref<CartItem[]>([])

// 推荐商品数据
const recommendedItems = ref<any[]>([])
const isLoadingRecommendations = ref(false)

// 计算属性
const selectedItems = computed(() => {
  if (!cartData.value) return []
  return cartData.value.filter((item) => item.selected)
})

const selectedCount = computed(() => {
  return selectedItems.value.length
})

const totalSelectedPoints = computed(() => {
  if (!cartData.value) return 0
  return selectedItems.value.reduce((total, item) => {
    return total + item.point_price * item.quantity
  }, 0)
})

// 方法
const handleSelectAll = (checked: boolean) => {
  if (!cartData.value) return
  cartData.value.forEach((item) => {
    item.selected = checked
  })
}

const updateSelectAll = () => {
  if (!cartData.value) return
  selectAll.value = cartData.value.every((item) => item.selected)
}

const updateTotal = () => {
  // 更新总积分等计算
}

const removeItem = async (item: CartItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除 ${item.item_name} 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 调用后端删除购物车商品接口，传递商品ID和用户ID作为请求体
    const response = await userApi.deletedShoppingCart({
      id: item.id,
      userId: item.user_id,
    })

    if (response && response.data !== undefined) {
      ElMessage.success('商品已删除')
      // 重新获取购物车数据
      await fetchShoppingCart()
    } else {
      ElMessage.error('删除商品失败，请重试')
    }
  } catch (error: any) {
    if (error.message && error.message.includes('cancel')) {
      // 用户取消删除，不显示错误
      return
    }
    console.error('删除商品失败:', error)
    ElMessage.error('删除商品失败，请重试')
  }
}

const addToCart = async (item: any) => {
  if (!currentUser.value || !currentUser.value.id) {
    ElMessage.error('请先登录')
    return
  }

  try {
    const now = new Date().toISOString()
    const cartData = {
      cartItems: [
        {
          cartId: 0,
          createTime: now,
          id: 0,
          itemId: item.id,
          itemImage: item.productImagePath || '',
          itemName: item.productName || '权益产品',
          itemType: 1, // 1表示权益产品
          pointPrice: item.price || 0,
          quantity: 1,
          updateTime: now,
          userId: currentUser.value.id,
        },
      ],
      createTime: now,
      id: 0,
      status: 1,
      totalSelectedPoints: item.price || 0,
      updateTime: now,
      userId: currentUser.value.id,
    }

    const response = await userApi.createShoppingCart(cartData)
    if (response && response.data !== undefined) {
      ElMessage.success(`已将 ${item.productName || '权益产品'} 加入购物车`)
      // 加入购物车成功后，自动刷新购物车数据
      await fetchShoppingCart()
    } else {
      ElMessage.error('加入购物车失败，请重试')
    }
  } catch (error: any) {
    console.error('加入购物车失败:', error)
    ElMessage.error('加入购物车失败，请重试')
  }
}

const checkout = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }

  ElMessage.success('正在跳转到结算页面...')
  // 这里应该跳转到结算页面
  // router.push('/checkout')
}

const clearCart = async () => {
  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '确认清空', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 调用后端清空购物车接口
    const response = await userApi.clearShoppingCart()
    if (response && response.data) {
      ElMessage.success('购物车已清空')
      // 主动刷新页面
      window.location.reload()
    }
  } catch (error: any) {
    console.error('清空购物车失败:', error)
    ElMessage.error('清空购物车失败，请重试')
  }
}

// 获取购物车数据
const fetchShoppingCart = async () => {
  isLoading.value = true
  try {
    const response = await userApi.showShoppingCart()
    if (response && response.data) {
      cartData.value = response.data
      // 为每个商品添加选中状态
      if (cartData.value) {
        cartData.value.forEach((item) => {
          item.selected = true // 默认选中
        })
      }
      // 更新全选状态
      updateSelectAll()
    }
  } catch (error: any) {
    console.error('获取购物车数据失败:', error)
    ElMessage.error('获取购物车数据失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 获取推荐产品
const fetchRecommendedProducts = async () => {
  if (isLoadingRecommendations.value) return
  isLoadingRecommendations.value = true

  try {
    const params = {
      pageNum: 1,
      pageSize: 4,
      status: 'ACTIVE',
    }

    const res = await productApi.queryAllProduct(params)
    if (res && res.data) {
      recommendedItems.value = res.data.data || []
    }
  } catch (error: any) {
    console.error('获取推荐产品失败:', error)
    ElMessage.error('获取推荐产品失败')
  } finally {
    isLoadingRecommendations.value = false
  }
}

// 获取图片URL
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return 'https://via.placeholder.com/100x100/909399/ffffff?text=无图'
  return BACKEND_CONFIG.getImageUrl(imagePath)
}

// 获取商品类型文本
const getItemTypeText = (itemType: number) => {
  switch (itemType) {
    case 1:
      return '权益产品'
    case 2:
      return '权益包'
    case 3:
      return '秒杀商品'
    default:
      return '未知类型'
  }
}

// 获取商品类型标签颜色
const getItemTypeTagType = (itemType: number) => {
  switch (itemType) {
    case 1:
      return 'primary'
    case 2:
      return 'success'
    case 3:
      return 'warning'
    default:
      return 'primary'
  }
}

// 组件挂载时获取购物车数据和推荐产品
onMounted(() => {
  fetchCurrentUser()
  fetchShoppingCart()
  fetchRecommendedProducts()
})
</script>

<style scoped>
.cart {
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

.loading-container {
  padding: 40px;
  text-align: center;
}

.loading-recommendations {
  padding: 20px;
  text-align: center;
}

.empty-cart {
  text-align: center;
  padding: 60px 0;
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  margin-bottom: 40px;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-count {
  color: #606266;
  font-size: 14px;
}

.cart-item {
  display: grid;
  grid-template-columns: auto 80px 1fr auto auto auto auto;
  gap: 20px;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.item-info p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
}

.item-tags {
  display: flex;
  gap: 8px;
}

.item-price {
  text-align: center;
}

.current-price {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
  display: block;
}

.item-total {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
  text-align: center;
}

.original-price {
  font-size: 12px;
  color: #c0c4cc;
  text-decoration: line-through;
}

.item-quantity {
  text-align: center;
}

.quantity-display {
  display: inline-block;
  padding: 8px 12px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  min-width: 60px;
  text-align: center;
}

.item-actions {
  text-align: center;
}

.cart-summary {
  position: sticky;
  top: 20px;
}

.summary-content {
  padding: 20px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.summary-item.total {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.price,
.final-price {
  color: #f56c6c;
  font-weight: bold;
}

.discount {
  color: #67c23a;
}

.shipping {
  color: #606266;
}

.summary-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendations {
  margin-top: 40px;
}

.recommendations h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 20px;
}

.recommendation-card {
  transition: all 0.3s;
  height: 340px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recommendation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.recommendation-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  margin-bottom: 0;
  transition: transform 0.3s ease;
}

.recommendation-image:hover {
  transform: scale(1.05);
}

.recommendation-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.recommendation-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
  font-weight: 600;
  line-height: 1.3;
  height: 36px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.recommendation-info p {
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
  height: 40px;
  overflow: hidden;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex: 1;
}

.recommendation-price {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recommendation-price .current-price {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}

.recommendation-actions {
  display: flex;
  justify-content: center;
  margin-top: auto;
}

.recommendation-actions .el-button {
  width: 100px;
  height: 32px;
  border-radius: 6px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.recommendation-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.section {
  margin-bottom: 48px;
  padding-left: 8px;
  padding-right: 8px;
}
</style>
