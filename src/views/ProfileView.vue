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
              <el-col :span="8">
                <div class="points-card">
                  <h3>当前积分</h3>
                  <p class="points-number">{{ userInfo.points }}</p>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="points-card">
                  <h3>累计获得</h3>
                  <p class="points-number">{{ userInfo.totalPoints }}</p>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="points-card">
                  <h3>已使用</h3>
                  <p class="points-number">{{ userInfo.usedPoints }}</p>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="points-history">
            <h3>积分记录</h3>
            <el-table :data="pointsHistory" style="width: 100%">
              <el-table-column prop="date" label="日期" width="180" />
              <el-table-column prop="description" label="描述" />
              <el-table-column prop="points" label="积分" width="100">
                <template #default="scope">
                  <span :class="scope.row.type === 'earn' ? 'earn' : 'spend'">
                    {{ scope.row.type === 'earn' ? '+' : '-' }}{{ scope.row.points }}
                  </span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api/user'

// 响应式数据
const activeMenu = ref('basic')
const isSaving = ref(false) // 保存状态
const originalAccount = ref('') // 原始用户名，用于比较是否修改

// 用户信息
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
  points: 0,
  totalPoints: 0,
  usedPoints: 0,
})

// 获取当前用户信息
const fetchCurrentUser = async () => {
  try {
    const response = await userApi.getCurrentUser()
    console.log('获取用户信息成功:', response)

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
        points: response.data.points || 0,
        totalPoints: response.data.totalPoints || 0,
        usedPoints: response.data.usedPoints || 0,
      }

      // 保存原始用户名，用于后续比较
      originalAccount.value = response.data.account || ''
    }
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败，请重新登录')
  }
}

// 积分历史
const pointsHistory = ref([
  {
    date: '2024-12-01 14:30:25',
    description: '购买VIP会员月卡',
    points: 500,
    type: 'earn',
  },
  {
    date: '2024-11-30 16:45:12',
    description: '兑换电影票券',
    points: 400,
    type: 'spend',
  },
  {
    date: '2024-11-29 09:15:33',
    description: '签到奖励',
    points: 10,
    type: 'earn',
  },
])

// 方法
const handleMenuSelect = (key: string) => {
  activeMenu.value = key
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
    console.log('更新用户信息成功:', response)
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

// 组件挂载时获取用户信息
onMounted(() => {
  fetchCurrentUser()
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

.section {
  margin-bottom: 48px;
  padding-left: 8px;
  padding-right: 8px;
}
</style>
