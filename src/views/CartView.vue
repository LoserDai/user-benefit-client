<template>
  <div class="cart">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>购物车</h1>
      <p>管理您的购物清单</p>
    </div>

    <div v-if="cartItems.length === 0" class="empty-cart">
      <el-empty description="购物车是空的">
        <el-button type="primary" @click="$router.push('/')">去购物</el-button>
      </el-empty>
    </div>

    <div v-else class="cart-content">
      <!-- 购物车商品列表 -->
      <div class="cart-items">
        <el-card>
          <template #header>
            <div class="cart-header">
              <el-checkbox v-model="selectAll" @change="handleSelectAll"> 全选 </el-checkbox>
              <span class="item-count">共 {{ cartItems.length }} 件商品</span>
            </div>
          </template>

          <div class="cart-item" v-for="item in cartItems" :key="item.id">
            <el-checkbox v-model="item.selected" @change="updateSelectAll" />
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
              <div class="item-tags">
                <el-tag v-if="item.tag" :type="item.tagType" size="small">{{ item.tag }}</el-tag>
              </div>
            </div>
            <div class="item-price">
              <span class="current-price">¥{{ item.currentPrice }}</span>
              <span class="original-price" v-if="item.originalPrice"
                >¥{{ item.originalPrice }}</span
              >
            </div>
            <div class="item-quantity">
              <el-input-number
                v-model="item.quantity"
                :min="1"
                :max="item.stock"
                size="small"
                @change="updateTotal"
              />
            </div>
            <div class="item-total">¥{{ (item.currentPrice * item.quantity).toFixed(2) }}</div>
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
              <span>商品总价：</span>
              <span class="price">¥{{ totalPrice.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span>优惠折扣：</span>
              <span class="discount">-¥{{ totalDiscount.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span>运费：</span>
              <span class="shipping">{{
                shippingFee === 0 ? '免运费' : `¥${shippingFee.toFixed(2)}`
              }}</span>
            </div>
            <el-divider />
            <div class="summary-item total">
              <span>实付金额：</span>
              <span class="final-price">¥{{ finalPrice.toFixed(2) }}</span>
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
      <el-row :gutter="20">
        <el-col :span="6" v-for="item in recommendedItems" :key="item.id">
          <el-card class="recommendation-card" @click="addToCart(item)">
            <img :src="item.image" :alt="item.name" class="recommendation-image" />
            <div class="recommendation-info">
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
              <div class="recommendation-price">
                <span class="current-price">¥{{ item.currentPrice }}</span>
                <span class="original-price" v-if="item.originalPrice"
                  >¥{{ item.originalPrice }}</span
                >
              </div>
              <el-button type="primary" size="small">加入购物车</el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 响应式数据
const selectAll = ref(false)

// 购物车商品数据
const cartItems = ref([
  {
    id: 1,
    name: 'VIP会员月卡',
    description: '享受专属权益和服务',
    image: 'https://via.placeholder.com/100x100/409eff/ffffff?text=VIP',
    currentPrice: 29.9,
    originalPrice: 39.9,
    quantity: 1,
    stock: 10,
    selected: true,
    tag: '热销',
    tagType: 'danger',
  },
  {
    id: 2,
    name: '流量包10GB',
    description: '全国通用流量包',
    image: 'https://via.placeholder.com/100x100/67c23a/ffffff?text=流量',
    currentPrice: 19.9,
    originalPrice: 25.9,
    quantity: 2,
    stock: 50,
    selected: true,
    tag: '新品',
    tagType: 'success',
  },
  {
    id: 3,
    name: '话费充值100元',
    description: '话费充值立享优惠',
    image: 'https://via.placeholder.com/100x100/e6a23c/ffffff?text=话费',
    currentPrice: 95,
    originalPrice: 100,
    quantity: 1,
    stock: 100,
    selected: false,
  },
])

// 推荐商品数据
const recommendedItems = ref([
  {
    id: 4,
    name: '电影票券',
    description: '全国影院通用电影票',
    image: 'https://via.placeholder.com/300x200/f56c6c/ffffff?text=电影票',
    currentPrice: 35,
    originalPrice: 45,
  },
  {
    id: 5,
    name: 'KTV欢唱券',
    description: '全国连锁KTV通用',
    image: 'https://via.placeholder.com/300x200/909399/ffffff?text=KTV',
    currentPrice: 88,
    originalPrice: 128,
  },
  {
    id: 6,
    name: '美食优惠券',
    description: '全国知名餐厅通用',
    image: 'https://via.placeholder.com/300x200/67c23a/ffffff?text=美食',
    currentPrice: 50,
    originalPrice: 80,
  },
  {
    id: 7,
    name: '游戏充值券',
    description: '热门游戏充值券',
    image: 'https://via.placeholder.com/300x200/409eff/ffffff?text=游戏',
    currentPrice: 100,
    originalPrice: 150,
  },
])

// 计算属性
const selectedItems = computed(() => {
  return cartItems.value.filter((item) => item.selected)
})

const selectedCount = computed(() => {
  return selectedItems.value.length
})

const totalPrice = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    return total + item.currentPrice * item.quantity
  }, 0)
})

const totalDiscount = computed(() => {
  return selectedItems.value.reduce((total, item) => {
    if (item.originalPrice) {
      return total + (item.originalPrice - item.currentPrice) * item.quantity
    }
    return total
  }, 0)
})

const shippingFee = computed(() => {
  return totalPrice.value >= 99 ? 0 : 10
})

const finalPrice = computed(() => {
  return totalPrice.value + shippingFee.value
})

// 方法
const handleSelectAll = (checked: boolean) => {
  cartItems.value.forEach((item) => {
    item.selected = checked
  })
}

const updateSelectAll = () => {
  selectAll.value = cartItems.value.every((item) => item.selected)
}

const updateTotal = () => {
  // 更新总价等计算
}

const removeItem = async (item: any) => {
  try {
    await ElMessageBox.confirm(`确定要删除 ${item.name} 吗？`, '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const index = cartItems.value.findIndex((cartItem) => cartItem.id === item.id)
    if (index > -1) {
      cartItems.value.splice(index, 1)
      ElMessage.success('商品已删除')
    }
  } catch {
    // 用户取消删除
  }
}

const addToCart = (item: any) => {
  const existingItem = cartItems.value.find((cartItem) => cartItem.id === item.id)
  if (existingItem) {
    existingItem.quantity++
    ElMessage.success(`已增加 ${item.name} 的数量`)
  } else {
    cartItems.value.push({
      ...item,
      quantity: 1,
      stock: 10,
      selected: true,
    })
    ElMessage.success(`已将 ${item.name} 加入购物车`)
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

    cartItems.value = []
    ElMessage.success('购物车已清空')
  } catch {
    // 用户取消清空
  }
}
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

.original-price {
  font-size: 12px;
  color: #c0c4cc;
  text-decoration: line-through;
}

.item-quantity {
  text-align: center;
}

.item-total {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
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
  cursor: pointer;
  transition: all 0.3s;
  height: 300px;
  margin-bottom: 20px;
}

.recommendation-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.recommendation-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 12px;
}

.recommendation-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.recommendation-info p {
  color: #606266;
  font-size: 14px;
  margin-bottom: 12px;
  height: 40px;
  overflow: hidden;
}

.recommendation-price {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommendation-price .current-price {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}

.recommendation-price .original-price {
  font-size: 12px;
  color: #c0c4cc;
  text-decoration: line-through;
}

.section {
  margin-bottom: 48px;
  padding-left: 8px;
  padding-right: 8px;
}
</style>
