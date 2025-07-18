<template>
  <div class="orders">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>我的订单</h1>
      <p>查看您的订单历史</p>
    </div>

    <!-- 订单状态筛选 -->
    <div class="order-tabs">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="待付款" name="pending" />
        <el-tab-pane label="待发货" name="paid" />
        <el-tab-pane label="待收货" name="shipped" />
        <el-tab-pane label="已完成" name="completed" />
        <el-tab-pane label="已取消" name="cancelled" />
      </el-tabs>
    </div>

    <!-- 订单列表 -->
    <div class="orders-list">
      <el-card v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-number">订单号：{{ order.orderNumber }}</span>
            <span class="order-date">{{ order.createTime }}</span>
          </div>
          <div class="order-status">
            <el-tag :type="getStatusType(order.status)">{{ getStatusText(order.status) }}</el-tag>
          </div>
        </div>

        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-info">
              <h3>{{ item.name }}</h3>
              <p>{{ item.description }}</p>
              <div class="item-meta">
                <span class="item-price">¥{{ item.price }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-total">
            <span>共 {{ order.totalQuantity }} 件商品</span>
            <span class="total-price">实付：¥{{ order.totalAmount }}</span>
          </div>
          <div class="order-actions">
            <el-button
              v-if="order.status === 'pending'"
              type="primary"
              size="small"
              @click="payOrder(order)"
            >
              立即付款
            </el-button>
            <el-button
              v-if="order.status === 'shipped'"
              type="success"
              size="small"
              @click="confirmReceive(order)"
            >
              确认收货
            </el-button>
            <el-button
              v-if="order.status === 'completed'"
              size="small"
              @click="viewOrderDetail(order)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="order.status === 'pending'"
              type="danger"
              size="small"
              @click="cancelOrder(order)"
            >
              取消订单
            </el-button>
            <el-button v-if="order.status === 'completed'" size="small" @click="buyAgain(order)">
              再次购买
            </el-button>
          </div>
        </div>
      </el-card>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 响应式数据
const activeTab = ref('all')
const currentPage = ref(1)
const pageSize = ref(10)
const totalOrders = ref(50)

// 订单数据
const orders = ref([
  {
    id: 1,
    orderNumber: 'ORD20241201001',
    status: 'pending',
    createTime: '2024-12-01 14:30:25',
    totalAmount: 79.8,
    totalQuantity: 2,
    items: [
      {
        id: 1,
        name: 'VIP会员月卡',
        description: '享受专属权益和服务',
        image: 'https://via.placeholder.com/80x80/409eff/ffffff?text=VIP',
        price: 29.9,
        quantity: 1,
      },
      {
        id: 2,
        name: '流量包10GB',
        description: '全国通用流量包',
        image: 'https://via.placeholder.com/80x80/67c23a/ffffff?text=流量',
        price: 19.9,
        quantity: 1,
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'ORD20241130002',
    status: 'paid',
    createTime: '2024-11-30 16:45:12',
    totalAmount: 95.0,
    totalQuantity: 1,
    items: [
      {
        id: 3,
        name: '话费充值100元',
        description: '话费充值立享优惠',
        image: 'https://via.placeholder.com/80x80/e6a23c/ffffff?text=话费',
        price: 95.0,
        quantity: 1,
      },
    ],
  },
  {
    id: 3,
    orderNumber: 'ORD20241129003',
    status: 'shipped',
    createTime: '2024-11-29 09:15:33',
    totalAmount: 35.0,
    totalQuantity: 1,
    items: [
      {
        id: 4,
        name: '电影票券',
        description: '全国影院通用电影票',
        image: 'https://via.placeholder.com/80x80/f56c6c/ffffff?text=电影票',
        price: 35.0,
        quantity: 1,
      },
    ],
  },
  {
    id: 4,
    orderNumber: 'ORD20241128004',
    status: 'completed',
    createTime: '2024-11-28 20:22:18',
    totalAmount: 88.0,
    totalQuantity: 1,
    items: [
      {
        id: 5,
        name: 'KTV欢唱券',
        description: '全国连锁KTV通用',
        image: 'https://via.placeholder.com/80x80/909399/ffffff?text=KTV',
        price: 88.0,
        quantity: 1,
      },
    ],
  },
  {
    id: 5,
    orderNumber: 'ORD20241127005',
    status: 'cancelled',
    createTime: '2024-11-27 11:30:45',
    totalAmount: 50.0,
    totalQuantity: 1,
    items: [
      {
        id: 6,
        name: '美食优惠券',
        description: '全国知名餐厅通用',
        image: 'https://via.placeholder.com/80x80/67c23a/ffffff?text=美食',
        price: 50.0,
        quantity: 1,
      },
    ],
  },
])

// 计算属性
const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  }
  return orders.value.filter((order) => order.status === activeTab.value)
})

// 方法
const handleTabClick = () => {
  currentPage.value = 1
}

const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'warning',
    paid: 'primary',
    shipped: 'info',
    completed: 'success',
    cancelled: 'danger',
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '待付款',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消',
  }
  return statusMap[status] || '未知状态'
}

const payOrder = (order: any) => {
  ElMessage.success(`正在跳转到支付页面，订单号：${order.orderNumber}`)
  // 这里应该跳转到支付页面
}

const confirmReceive = async (order: any) => {
  try {
    await ElMessageBox.confirm(`确认已收到订单 ${order.orderNumber} 的商品吗？`, '确认收货', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    })

    order.status = 'completed'
    ElMessage.success('确认收货成功')
  } catch {
    // 用户取消确认
  }
}

const viewOrderDetail = (order: any) => {
  ElMessage.success(`查看订单详情：${order.orderNumber}`)
  // 这里应该跳转到订单详情页面
}

const cancelOrder = async (order: any) => {
  try {
    await ElMessageBox.confirm(`确定要取消订单 ${order.orderNumber} 吗？`, '确认取消', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    order.status = 'cancelled'
    ElMessage.success('订单已取消')
  } catch {
    // 用户取消操作
  }
}

const buyAgain = (order: any) => {
  ElMessage.success('正在为您重新购买商品...')
  // 这里应该将商品重新加入购物车
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
}

.order-item:last-child {
  border-bottom: none;
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
</style>
