<template>
  <div class="profile">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>个人中心</h1>
      <p>管理您的个人信息和账户设置</p>
    </div>

    <div class="profile-content">
      <!-- 左侧导航 -->
      <div class="profile-sidebar">
        <el-card>
          <div class="user-info">
            <el-avatar :size="80" :src="userInfo.avatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <h3>{{ userInfo.account }}</h3>
            <p class="user-id">ID: {{ userInfo.id }}</p>
            <p>{{ userInfo.email }}</p>
            <div class="user-tags">
              <el-tag :type="getUserRoleTagType(userInfo.userRole)" size="small">
                {{ getUserRoleText(userInfo.userRole) }}
              </el-tag>
              <el-tag :type="getStatusTagType(userInfo.status)" size="small">
                {{ getStatusText(userInfo.status) }}
              </el-tag>
            </div>
          </div>

          <el-menu :default-active="activeMenu" @select="handleMenuSelect" class="profile-menu">
            <el-menu-item index="basic">
              <el-icon><UserFilled /></el-icon>
              <span>基本信息</span>
            </el-menu-item>

            <el-menu-item index="points">
              <el-icon><Coin /></el-icon>
              <span>积分管理</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </div>

      <!-- 右侧内容 -->
      <div class="profile-main">
        <!-- 基本信息 -->
        <el-card v-if="activeMenu === 'basic'" class="profile-card">
          <template #header>
            <h2>基本信息</h2>
          </template>

          <el-form :model="userInfo" label-width="100px">
            <el-form-item label="用户编号">
              <el-input v-model="userInfo.id" disabled />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="userInfo.account" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userInfo.email" disabled />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="userInfo.phone" />
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="userInfo.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
                <el-radio label="other">Alien</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="账户状态">
              <el-input :value="getStatusText(userInfo.status)" disabled />
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                @click="saveBasicInfo"
                :loading="isSaving"
                :disabled="isSaving"
              >
                {{ isSaving ? '保存中...' : '保存修改' }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 积分管理 -->
        <el-card v-if="activeMenu === 'points'" class="profile-card">
          <template #header>
            <h2>积分管理</h2>
          </template>

          <div class="points-overview">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="points-card">
                  <h3>当前积分</h3>
                  <p class="points-number">{{ userInfo.points }}</p>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="points-card">
                  <h3>账户余额</h3>
                  <p class="points-number balance-number">¥{{ userInfo.balance }}</p>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="points-history">
            <h3>积分记录</h3>
            <el-table :data="filteredPointsHistory" style="width: 100%" v-loading="isLoadingPoints">
              <el-table-column prop="createTime" label="日期" width="180">
                <template #default="scope">
                  {{ formatDate(scope.row.createTime) }}
                </template>
              </el-table-column>
              <el-table-column prop="id" label="交易编号" width="120" />
              <el-table-column prop="remark" label="描述" />
              <el-table-column prop="displayValue" label="变动金额" width="100">
                <template #default="scope">
                  <span :class="scope.row.displayValue > 0 ? 'earn' : 'spend'">
                    {{ scope.row.displayValue > 0 ? '+' : '' }}{{ scope.row.displayValue }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="displayLabel" label="变动类型" width="100">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.displayType === 'point' ? 'primary' : 'success'"
                    size="small"
                  >
                    {{ scope.row.displayLabel }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="pointsAfter" label="Points" width="100">
                <template #default="scope">
                  <span class="balance-after">{{ scope.row.pointsAfter }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="balanceAfter" label="Balance" width="100">
                <template #default="scope">
                  <span class="balance-after">{{ scope.row.balanceAfter }}</span>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分页 -->
            <div class="pagination-container">
              <el-pagination
                v-model:current-page="pagination.pageNum"
                v-model:page-size="pagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="pagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api/user'

// 响应式数据
const activeMenu = ref('basic')
const isSaving = ref(false) // 保存状态
const originalAccount = ref('') // 原始用户名，用于比较是否修改

// 用户信息 - 支持decimal类型
const userInfo = ref({
  id: '',
  account: '',
  email: '',
  phone: '',
  gender: 'male',
  status: '',
  birthday: '',
  avatar: '',
  userRole: 0, // 改为数字类型，0表示普通用户，1表示管理员
  points: '0', // 支持decimal类型
  balance: '0', // 支持decimal类型
})

// 积分历史 - 初始化为空数组，从后端获取
const pointsHistory = ref([])

// 分页相关
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

const isLoadingPoints = ref(false) // 积分记录加载状态

// 过滤后的积分历史 - 只显示有实际变动的记录
const filteredPointsHistory = computed(() => {
  const result: any[] = []

  pointsHistory.value.forEach((item: any) => {
    const pointChange = parseFloat(item.changePoint) || 0
    const balanceChange = parseFloat(item.changeBalance) || 0

    // 如果积分有变动，创建积分记录
    if (pointChange !== 0) {
      result.push({
        ...item,
        displayType: 'point',
        displayValue: pointChange,
        displayLabel: 'Points变动',
      })
    }

    // 如果余额有变动，创建余额记录
    if (balanceChange !== 0) {
      result.push({
        ...item,
        displayType: 'balance',
        displayValue: balanceChange,
        displayLabel: 'Balance变动',
      })
    }
  })

  return result
})

// 获取当前用户信息
const fetchCurrentUser = async () => {
  try {
    const response = await userApi.getCurrentUser()

    // 更新用户信息
    if (response.data) {
      // 性别转换：1->male, 0->female, 3->other
      const genderMap: { [key: number]: string } = {
        1: 'male',
        0: 'female',
        3: 'other',
      }

      userInfo.value = {
        ...userInfo.value,
        id: response.data.id || '未知',
        account: response.data.account || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        gender: genderMap[response.data.gender] || 'male',
        status: response.data.status || '',
        birthday: response.data.birthday || '',
        avatar: response.data.avatar || '',
        userRole: response.data.userRole || 0,
        points: String(response.data.points || '0'),
        balance: String(response.data.balance || '0'),
      }

      // 保存原始用户名，用于后续比较
      originalAccount.value = response.data.account || ''
    }
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败，请重新登录')
  }
}

// 查询积分和余额
const fetchPointsAndBalance = async () => {
  try {
    // 查询积分和余额，传递默认的ccy参数
    const response = await userApi.queryPoints('B/P')

    if (response.data) {
      // 支持decimal类型，转换为字符串显示
      userInfo.value.points = String(response.data.points || '0')
      userInfo.value.balance = String(response.data.balance || '0')
    }
  } catch (error: any) {
    console.error('查询积分和余额失败:', error)
    ElMessage.error('查询积分和余额失败，请重试')
  }
}

// 积分历史
const fetchPointsHistory = async () => {
  // 检查用户ID是否有效
  if (!userInfo.value.id || userInfo.value.id === '未知') {
    return
  }

  isLoadingPoints.value = true
  try {
    const requestParams = {
      userId: Number(userInfo.value.id),
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
      sortField: 'createTime',
      sortOrder: 'desc',
    }

    const response = await userApi.queryAllPointTransaction(requestParams)

    if (response && response.data) {
      pointsHistory.value = response.data.data || []
      // 更新分页总数 - 使用后端返回的总数，而不是前端过滤后的数据长度
      pagination.value.total = response.data.total || 0
    }
  } catch (error: any) {
    console.error('获取积分记录失败:', error)
    ElMessage.error('获取积分记录失败，请重试')
  } finally {
    isLoadingPoints.value = false
  }
}

// 方法
const handleMenuSelect = (key: string) => {
  activeMenu.value = key

  // 当选择积分管理时，调用查询积分和余额接口
  if (key === 'points') {
    fetchPointsAndBalance()
    // 选择积分管理时也加载积分记录，确保用户ID有效
    if (userInfo.value.id && userInfo.value.id !== '未知') {
      fetchPointsHistory()
    } else {
      // 如果用户ID还没有，等待一下再尝试
      setTimeout(() => {
        if (userInfo.value.id && userInfo.value.id !== '未知') {
          fetchPointsHistory()
        }
      }, 200)
    }
  }
}

const saveBasicInfo = async () => {
  if (isSaving.value) return // 防止重复提交

  try {
    isSaving.value = true

    // 先校验用户名是否已存在（只有当用户名发生改变时才检查）
    if (userInfo.value.account !== originalAccount.value) {
      try {
        const checkResponse = await userApi.checkUsername(userInfo.value.account)
        // 如果请求成功，说明用户名可用，继续保存
      } catch (error: any) {
        // 如果错误码是40002，说明用户名已存在
        if (error.code === 40002) {
          ElMessage.error('用户名已存在，请选择其他用户名')
          return
        } else {
          // 其他错误，可能是网络问题等
          console.error('检查用户名失败:', error)
          ElMessage.error('检查用户名失败，请重试')
          return
        }
      }
    }

    // 性别转换：male->1, female->0, other->3
    const genderMap: { [key: string]: number } = {
      male: 1,
      female: 0,
      other: 3,
    }

    const updateData = {
      id: userInfo.value.id,
      account: userInfo.value.account,
      email: userInfo.value.email,
      phone: userInfo.value.phone,
      gender: genderMap[userInfo.value.gender] || 1,
      status: userInfo.value.status,
    }

    const response = await userApi.updateUser(updateData)

    ElMessage.success('基本信息保存成功')

    // 更新原始用户名，以便后续比较
    originalAccount.value = userInfo.value.account

    // 可选：重新获取用户信息以确保数据同步
    // await fetchCurrentUser()
  } catch (error: any) {
    console.error('更新用户信息失败:', error)
    ElMessage.error('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return '已激活'
    case 'INACTIVE':
      return '未激活'
    default:
      return '已注销'
  }
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success'
    case 'INACTIVE':
      return 'warning'
    default:
      return 'danger'
  }
}

// 获取用户角色文本
const getUserRoleText = (userRole: string | number) => {
  if (userRole === 0 || userRole === '0') {
    return '普通用户'
  } else if (userRole === 1 || userRole === '1') {
    return '管理员'
  }
  return '普通用户'
}

// 获取用户角色标签类型
const getUserRoleTagType = (userRole: string | number) => {
  if (userRole === 1 || userRole === '1') {
    return 'warning' // 金色标签
  }
  return 'info' // 普通标签
}

// 日期格式化
const formatDate = (timestamp: string) => {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 积分变动类型文本
const getChangeTypeText = (type: number) => {
  switch (type) {
    case 1:
      return '收入'
    case 2:
      return '支出'
    default:
      return '未知'
  }
}

// 积分变动类型标签类型
const getChangeTypeTagType = (type: number) => {
  switch (type) {
    case 1:
      return 'success'
    case 2:
      return 'danger'
    default:
      return 'info'
  }
}

// 分页相关方法
const handleSizeChange = (val: number) => {
  pagination.value.pageSize = val
  pagination.value.pageNum = 1 // 切换每页大小时重置到第一页
  fetchPointsHistory()
}

const handleCurrentChange = (val: number) => {
  pagination.value.pageNum = val
  fetchPointsHistory()
}

// 组件挂载时获取用户信息
onMounted(async () => {
  await fetchCurrentUser() // 先获取用户信息
  // 用户信息获取完成后再加载积分记录
  // 延迟一下确保用户ID已经设置
  setTimeout(() => {
    if (userInfo.value.id && userInfo.value.id !== '未知') {
      fetchPointsHistory()
    }
  }, 100)
})
</script>

<style scoped>
.profile {
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

.profile-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

.profile-sidebar {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.user-info {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.user-info h3 {
  margin: 16px 0 8px 0;
  color: #303133;
}

.user-info p {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
}

.user-id {
  color: #909399 !important;
  font-size: 12px !important;
  font-family: 'Courier New', monospace;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  margin: 4px 0 !important;
}

.user-tags {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}

.profile-menu {
  border: none;
}

.profile-card {
  min-height: 500px;
}

.profile-card h2 {
  margin: 0;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-overview {
  margin-bottom: 30px;
}

.points-card {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.points-card h3 {
  margin: 0 0 12px 0;
  color: #606266;
  font-size: 14px;
}

.points-number {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin: 0;
}

.balance-number {
  color: #67c23a;
}

.points-history h3 {
  margin: 0 0 20px 0;
  color: #303133;
}

.earn {
  color: #67c23a;
  font-weight: bold;
}

.spend {
  color: #f56c6c;
  font-weight: bold;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

.balance-after {
  color: #606266;
  font-weight: 500;
}

.section {
  margin-bottom: 48px;
  padding-left: 8px;
  padding-right: 8px;
}
</style>
