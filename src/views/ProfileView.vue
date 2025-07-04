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
            <h3>{{ userInfo.username }}</h3>
            <p>{{ userInfo.email }}</p>
            <el-tag :type="userInfo.vipLevel === 'VIP' ? 'warning' : 'info'">
              {{ userInfo.vipLevel }}
            </el-tag>
          </div>

          <el-menu :default-active="activeMenu" @select="handleMenuSelect" class="profile-menu">
            <el-menu-item index="basic">
              <el-icon><UserFilled /></el-icon>
              <span>基本信息</span>
            </el-menu-item>
            <el-menu-item index="security">
              <el-icon><Lock /></el-icon>
              <span>账户安全</span>
            </el-menu-item>
            <el-menu-item index="points">
              <el-icon><Coin /></el-icon>
              <span>积分管理</span>
            </el-menu-item>
            <el-menu-item index="address">
              <el-icon><Location /></el-icon>
              <span>收货地址</span>
            </el-menu-item>
            <el-menu-item index="preferences">
              <el-icon><Setting /></el-icon>
              <span>偏好设置</span>
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
            <el-form-item label="用户名">
              <el-input v-model="userInfo.username" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userInfo.email" disabled />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="userInfo.phone" />
            </el-form-item>
            <el-form-item label="昵称">
              <el-input v-model="userInfo.nickname" />
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="userInfo.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
                <el-radio label="other">其他</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="生日">
              <el-date-picker v-model="userInfo.birthday" type="date" placeholder="选择日期" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicInfo">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 账户安全 -->
        <el-card v-if="activeMenu === 'security'" class="profile-card">
          <template #header>
            <h2>账户安全</h2>
          </template>

          <div class="security-items">
            <div class="security-item">
              <div class="security-info">
                <h3>登录密码</h3>
                <p>定期更换密码可以保护账户安全</p>
              </div>
              <el-button @click="changePassword">修改密码</el-button>
            </div>

            <div class="security-item">
              <div class="security-info">
                <h3>手机绑定</h3>
                <p>已绑定：{{ userInfo.phone || '未绑定' }}</p>
              </div>
              <el-button @click="bindPhone">绑定手机</el-button>
            </div>

            <div class="security-item">
              <div class="security-info">
                <h3>邮箱绑定</h3>
                <p>已绑定：{{ userInfo.email }}</p>
              </div>
              <el-button @click="bindEmail">修改邮箱</el-button>
            </div>
          </div>
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

        <!-- 收货地址 -->
        <el-card v-if="activeMenu === 'address'" class="profile-card">
          <template #header>
            <div class="card-header">
              <h2>收货地址</h2>
              <el-button type="primary" @click="addAddress">新增地址</el-button>
            </div>
          </template>

          <div class="address-list">
            <div v-for="address in addresses" :key="address.id" class="address-item">
              <div class="address-info">
                <div class="address-header">
                  <span class="name">{{ address.name }}</span>
                  <span class="phone">{{ address.phone }}</span>
                  <el-tag v-if="address.isDefault" type="success" size="small">默认</el-tag>
                </div>
                <p class="address-detail">
                  {{ address.province }} {{ address.city }} {{ address.district }}
                  {{ address.detail }}
                </p>
              </div>
              <div class="address-actions">
                <el-button size="small" @click="editAddress(address)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteAddress(address)"
                  >删除</el-button
                >
                <el-button
                  v-if="!address.isDefault"
                  size="small"
                  @click="setDefaultAddress(address)"
                >
                  设为默认
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 偏好设置 -->
        <el-card v-if="activeMenu === 'preferences'" class="profile-card">
          <template #header>
            <h2>偏好设置</h2>
          </template>

          <el-form :model="preferences" label-width="120px">
            <el-form-item label="消息通知">
              <el-switch v-model="preferences.emailNotification" />
              <span class="form-tip">邮件通知</span>
            </el-form-item>
            <el-form-item label="">
              <el-switch v-model="preferences.smsNotification" />
              <span class="form-tip">短信通知</span>
            </el-form-item>
            <el-form-item label="">
              <el-switch v-model="preferences.pushNotification" />
              <span class="form-tip">推送通知</span>
            </el-form-item>

            <el-form-item label="隐私设置">
              <el-checkbox v-model="preferences.showProfile">允许其他用户查看我的资料</el-checkbox>
            </el-form-item>
            <el-form-item label="">
              <el-checkbox v-model="preferences.showOrders">允许其他用户查看我的订单</el-checkbox>
            </el-form-item>

            <el-form-item label="语言设置">
              <el-select v-model="preferences.language">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="savePreferences">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const activeMenu = ref('basic')

// 用户信息
const userInfo = ref({
  username: 'user123',
  email: 'user123@example.com',
  phone: '138****8888',
  nickname: '小明',
  gender: 'male',
  birthday: '1990-01-01',
  avatar: '',
  vipLevel: 'VIP',
  points: 2580,
  totalPoints: 5000,
  usedPoints: 2420,
})

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

// 收货地址
const addresses = ref([
  {
    id: 1,
    name: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '三里屯街道1号',
    isDefault: true,
  },
  {
    id: 2,
    name: '李四',
    phone: '13900139000',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '陆家嘴街道2号',
    isDefault: false,
  },
])

// 偏好设置
const preferences = ref({
  emailNotification: true,
  smsNotification: false,
  pushNotification: true,
  showProfile: true,
  showOrders: false,
  language: 'zh-CN',
})

// 方法
const handleMenuSelect = (key: string) => {
  activeMenu.value = key
}

const saveBasicInfo = () => {
  ElMessage.success('基本信息保存成功')
}

const changePassword = () => {
  ElMessage.info('跳转到修改密码页面')
}

const bindPhone = () => {
  ElMessage.info('跳转到绑定手机页面')
}

const bindEmail = () => {
  ElMessage.info('跳转到修改邮箱页面')
}

const addAddress = () => {
  ElMessage.info('跳转到新增地址页面')
}

const editAddress = (address: any) => {
  ElMessage.info(`编辑地址：${address.name}`)
}

const deleteAddress = (address: any) => {
  ElMessage.info(`删除地址：${address.name}`)
}

const setDefaultAddress = (address: any) => {
  addresses.value.forEach((addr) => (addr.isDefault = false))
  address.isDefault = true
  ElMessage.success('默认地址设置成功')
}

const savePreferences = () => {
  ElMessage.success('偏好设置保存成功')
}
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

.security-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.security-info h3 {
  margin: 0 0 8px 0;
  color: #303133;
}

.security-info p {
  margin: 0;
  color: #606266;
  font-size: 14px;
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

.address-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.name {
  font-weight: bold;
  color: #303133;
}

.phone {
  color: #606266;
  font-size: 14px;
}

.address-detail {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.address-actions {
  display: flex;
  gap: 8px;
}

.form-tip {
  margin-left: 8px;
  color: #606266;
  font-size: 14px;
}

.section {
  margin-bottom: 48px;
  padding-left: 8px;
  padding-right: 8px;
}
</style>
