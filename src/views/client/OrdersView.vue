<template>
  <div class="orders">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>我的订单</h1>
      <p>查看您的订单历史</p>
    </div>

    <!-- 订单状态筛选 -->
    <div class="order-tabs">
      <el-tabs v-model="activeTab" @change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="待付款" name="0" />
        <el-tab-pane label="待发货" name="1" />
        <el-tab-pane label="待收货" name="2" />
        <el-tab-pane label="已完成" name="3" />
        <el-tab-pane label="已取消" name="4" />
      </el-tabs>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-section">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 订单列表 -->
    <div v-else-if="filteredOrders.length > 0" class="orders-list">
      <el-card v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-number">订单号：{{ formatOrderNumber(order.orderId) }}</span>
            <span class="order-date">{{ formatOrderDate() }}</span>
          </div>
          <div class="order-status">
            <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
          </div>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <div class="item-info">
              <h3>{{ item.itemName }}</h3>
              <p class="item-type">{{ getItemTypeText(item.itemType) }}</p>
              <div class="item-meta">
                <span class="item-price">{{ item.pointPrice }} Points</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-total">
            <span>共 {{ order.totalQuantity }} 件商品</span>
            <span class="total-price">实付：{{ order.totalPoint }} Points</span>
          </div>
          <div class="order-actions">
            <el-button
              v-if="order.status === 0"
              type="primary"
              size="small"
              @click="payOrder(order)"
            >
              立即付款
            </el-button>
            <el-button
              v-if="order.status === 2"
              type="success"
              size="small"
              @click="confirmReceive(order)"
            >
              确认收货
            </el-button>
            <el-button v-if="order.status === 3" size="small" @click="viewOrderDetail(order)">
              查看详情
            </el-button>
            <el-button
              v-if="order.status === 0"
              type="danger"
              size="small"
              @click="cancelOrder(order)"
            >
              取消订单
            </el-button>
            <el-button v-if="order.status === 3" size="small" @click="buyAgain(order)">
              再次购买
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-section">
      <el-empty :description="getEmptyMessage()" />
    </div>

    <!-- 分页 -->
    <div class="pagination-section">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="totalOrders"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '@/api/user'

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
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const totalOrders = ref(0)
const isLoading = ref(false)

// 订单数据
const orders = ref<any[]>([])

// 获取订单数据
const fetchOrders = async () => {
  if (!currentUser.value || !currentUser.value.id) {
    return
  }

  if (isLoading.value) return
  isLoading.value = true

  try {
    const params: any = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      userId: currentUser.value.id,
    }

    // 根据选中的标签设置状态筛选
    if (activeTab.value !== 'all') {
      params.status = Number(activeTab.value)
    }

    const response = await userApi.queryOrderMain(params)
    if (response && response.data) {
      orders.value = response.data.data || []
      totalOrders.value = response.data.total || 0
    }
  } catch (error: any) {
    console.error('获取订单数据失败:', error)
    ElMessage.error('获取订单数据失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 计算属性：按orderId分组订单
const filteredOrders = computed(() => {
  if (!orders.value || orders.value.length === 0) {
    return []
  }

  // 按orderId分组
  const orderGroups = new Map<number, any[]>()

  orders.value.forEach((order) => {
    const orderId = order.orderId
    if (!orderGroups.has(orderId)) {
      orderGroups.set(orderId, [])
    }
    orderGroups.get(orderId)!.push(order)
  })

  // 转换为订单数组，每个订单包含多个商品
  const groupedOrders: any[] = []

  orderGroups.forEach((items, orderId) => {
    // 取第一个商品的信息作为订单基本信息
    const firstItem = items[0]

    // 计算订单总积分和总数量
    const totalPoints = items.reduce((sum, item) => sum + (item.totalPoint || 0), 0)
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0)

    // 创建分组后的订单对象
    const groupedOrder = {
      orderId: orderId,
      status: firstItem.status,
      userId: firstItem.userId,
      // 商品列表
      items: items.map((item) => ({
        id: item.id,
        itemType: item.itemType,
        itemName: item.itemName,
        pointPrice: item.pointPrice,
        quantity: item.quantity,
        totalPoint: item.totalPoint,
      })),
      // 订单总计
      totalPoint: totalPoints,
      totalQuantity: totalQuantity,
    }

    groupedOrders.push(groupedOrder)
  })

  return groupedOrders
})

// 方法
const handleTabChange = (tabName: string) => {
  currentPage.value = 1
}

const getStatusType = (status: number) => {
  const statusMap: Record<number, string> = {
    0: 'warning', // 待支付
    1: 'primary', // 已支付
    2: 'info', // 已发货
    3: 'success', // 已完成
    4: 'danger', // 已取消
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待付款',
    1: '待发货',
    2: '待收货',
    3: '已完成',
    4: '已取消',
  }
  return statusMap[status] || '未知状态'
}

// 获取商品类型文本
const getItemTypeText = (itemType: number) => {
  const typeMap: Record<number, string> = {
    1: '权益产品',
    2: '权益包',
    3: '其他类型',
  }
  return typeMap[itemType] || '未知类型'
}

// 格式化订单号：ORDERID + 时间戳 + orderId
const formatOrderNumber = (orderId: number) => {
  const timestamp = Date.now()
  return `ORDERID${timestamp}${orderId}`
}

// 格式化订单日期
const formatOrderDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 获取空状态消息
const getEmptyMessage = () => {
  if (activeTab.value === 'all') {
    return '暂无订单'
  }
  const statusText = getStatusText(Number(activeTab.value))
  return `暂无${statusText}订单`
}

const payOrder = (order: any) => {
  ElMessage.success(`正在跳转到支付页面，订单号：${formatOrderNumber(order.orderId)}`)
  // 这里应该跳转到支付页面
}

const confirmReceive = async (order: any) => {
  try {
    await ElMessageBox.confirm(
      `确认已收到订单 ${formatOrderNumber(order.orderId)} 的商品吗？`,
      '确认收货',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    order.status = 3 // 已完成
    ElMessage.success('确认收货成功')
  } catch {
    // 用户取消确认
  }
}

const viewOrderDetail = (order: any) => {
  ElMessage.success(`查看订单详情：${formatOrderNumber(order.orderId)}`)
  // 这里应该跳转到订单详情页面
}

const cancelOrder = async (order: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消订单 ${formatOrderNumber(order.orderId)} 吗？`,
      '确认取消',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    order.status = 4 // 已取消
    ElMessage.success('订单已取消')
  } catch {
    // 用户取消操作
  }
}

const buyAgain = (order: any) => {
  ElMessage.success('正在为您重新购买商品...')
  // 这里应该将商品重新加入购物车
}

// 监听用户信息变化，自动获取订单数据
watch(currentUser, (newUser) => {
  if (newUser && newUser.id) {
    fetchOrders()
  }
})

// 监听标签变化，自动获取订单数据
watch(activeTab, (newTab) => {
  if (currentUser.value && currentUser.value.id) {
    currentPage.value = 1
    fetchOrders()
  }
})

// 组件挂载时获取数据
onMounted(() => {
  fetchCurrentUser()
})

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchOrders()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchOrders()
}
</script>

<style scoped>
.orders {
  padding: 40px 0 0 0;
}

.section {
  margin-bottom: 48px;
  padding-left: 8px;
  padding-right: 8px;
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

.order-tabs {
  margin-bottom: 30px;
}

.filter-status {
  margin-top: 12px;
  text-align: center;
}

.orders-list {
  margin-bottom: 40px;
}

.order-card {
  margin-bottom: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-number {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.order-date {
  font-size: 14px;
  color: #909399;
}

.order-status {
  display: flex;
  align-items: center;
}

.order-items {
  margin-bottom: 16px;
}

.order-item {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
  background: #fafafa;
  margin: 8px 0;
  border-radius: 6px;
  padding: 12px;
}

.order-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.order-item:first-child {
  margin-top: 0;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info {
  flex: 1;
}

.item-info h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #303133;
}

.item-info p {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #606266;
}

.item-type {
  background: #f0f2f5;
  color: #606266;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  font-size: 11px;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-size: 14px;
  font-weight: bold;
  color: #f56c6c;
}

.item-quantity {
  font-size: 12px;
  color: #909399;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.order-total {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-total span:first-child {
  font-size: 14px;
  color: #606266;
}

.total-price {
  font-size: 16px;
  font-weight: bold;
  color: #f56c6c;
}

.order-actions {
  display: flex;
  gap: 8px;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.loading-section {
  margin: 40px 0;
  padding: 20px;
}

.empty-section {
  margin: 40px 0;
  text-align: center;
}
</style>
