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

            <el-menu-item index="address">
              <el-icon><LocationFilled /></el-icon>
              <span>收货地址</span>
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

        <!-- 收货地址管理 -->
        <el-card v-if="activeMenu === 'address'" class="profile-card">
          <template #header>
            <div class="address-header">
              <h2>收货地址管理</h2>
              <el-button type="primary" @click="showAddAddressDialog = true">
                <el-icon><Plus /></el-icon>
                新增地址
              </el-button>
            </div>
          </template>

          <div class="address-list" v-loading="isLoadingAddresses">
            <el-empty v-if="addresses.length === 0" description="暂无收货地址" />

            <div v-else class="address-items">
              <div
                v-for="address in addresses"
                :key="address.id"
                class="address-item"
                :class="{ 'default-address': address.status === 1 }"
              >
                <div class="address-content">
                  <div class="address-info">
                    <div class="receiver-info">
                      <span class="receiver-name">{{ address.receiverName }}</span>
                      <span class="receiver-phone">{{ address.receiverPhone }}</span>
                    </div>
                    <div class="address-detail">
                      {{ address.province }} {{ address.city }} {{ address.district || '' }}
                      {{ address.detailAddress }}
                    </div>
                    <div class="address-meta">
                      <span class="postal-code">邮编: {{ address.postalCode || '暂无' }}</span>
                      <span class="create-time"
                        >创建时间: {{ formatDate(address.createTime) }}</span
                      >
                    </div>
                  </div>
                  <div class="address-actions">
                    <el-button type="primary" size="small" @click="editAddress(address)">
                      编辑
                    </el-button>
                    <el-button type="danger" size="small" @click="deleteAddress(address.id)">
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 地址分页 -->
            <div class="pagination-container" v-if="addressPagination.total > 0">
              <el-pagination
                v-model:current-page="addressPagination.pageNum"
                v-model:page-size="addressPagination.pageSize"
                :page-sizes="[5, 10, 20, 50]"
                :total="addressPagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleAddressSizeChange"
                @current-change="handleAddressCurrentChange"
              />
            </div>
          </div>
        </el-card>

        <!-- 编辑地址对话框 -->
        <el-dialog v-model="showEditAddressDialog" title="编辑收货地址" width="600px">
          <el-form
            :model="editAddressForm"
            :rules="addressRules"
            ref="editAddressFormRef"
            label-width="100px"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="收货人" prop="receiverName">
                  <el-input v-model="editAddressForm.receiverName" placeholder="请输入收货人姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号" prop="receiverPhone">
                  <el-input v-model="editAddressForm.receiverPhone" placeholder="请输入手机号" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="省份" prop="province">
                  <el-input v-model="editAddressForm.province" placeholder="请输入省份" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="城市" prop="city">
                  <el-input v-model="editAddressForm.city" placeholder="请输入城市" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="区县" prop="district">
                  <el-input v-model="editAddressForm.district" placeholder="请输入区县（可选）" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="详细地址" prop="detailAddress">
              <el-input v-model="editAddressForm.detailAddress" placeholder="请输入详细地址" />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="邮政编码" prop="postalCode">
                  <el-input
                    v-model="editAddressForm.postalCode"
                    placeholder="请输入邮政编码（可选）"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <template #footer>
            <span class="dialog-footer">
              <el-button @click="showEditAddressDialog = false">取消</el-button>
              <el-button type="primary" @click="saveEditAddress" :loading="isSavingAddress">
                {{ isSavingAddress ? '保存中...' : '保存' }}
              </el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 新增地址对话框 -->
        <el-dialog v-model="showAddAddressDialog" title="新增收货地址" width="600px">
          <el-form
            :model="addAddressForm"
            :rules="addressRules"
            ref="addAddressFormRef"
            label-width="100px"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="收货人" prop="receiverName">
                  <el-input v-model="addAddressForm.receiverName" placeholder="请输入收货人姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号" prop="receiverPhone">
                  <el-input v-model="addAddressForm.receiverPhone" placeholder="请输入手机号" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="省份" prop="province">
                  <el-input v-model="addAddressForm.province" placeholder="请输入省份" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="城市" prop="city">
                  <el-input v-model="addAddressForm.city" placeholder="请输入城市" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="区县" prop="district">
                  <el-input v-model="addAddressForm.district" placeholder="请输入区县（可选）" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="详细地址" prop="detailAddress">
              <el-input v-model="addAddressForm.detailAddress" placeholder="请输入详细地址" />
            </el-form-item>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="邮政编码" prop="postalCode">
                  <el-input
                    v-model="addAddressForm.postalCode"
                    placeholder="请输入邮政编码（可选）"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>

          <template #footer>
            <span class="dialog-footer">
              <el-button @click="cancelAddAddress">取消</el-button>
              <el-button type="primary" @click="saveAddAddress" :loading="isSavingAddress">
                {{ isSavingAddress ? '保存中...' : '保存' }}
              </el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { LocationFilled, Plus, UserFilled, Coin, User } from '@element-plus/icons-vue'
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

// 地址管理相关数据
const addresses = ref<any[]>([])
const isLoadingAddresses = ref(false)
const showAddAddressDialog = ref(false)
const showEditAddressDialog = ref(false)
const currentAddress = ref<any>(null)
const isSavingAddress = ref(false)
const editAddressFormRef = ref()
const addAddressFormRef = ref()

// 地址分页相关
const addressPagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
})

// 编辑地址表单
const editAddressForm = ref({
  id: 0,
  userId: 0,
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  status: 1,
  district: '',
  detailAddress: '',
  postalCode: '',
})

// 新增地址表单
const addAddressForm = ref({
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  status: 1,
  district: '',
  detailAddress: '',
  postalCode: '',
})

// 地址表单验证规则
const addressRules = {
  receiverName: [{ required: true, message: '请输入收货人姓名', trigger: 'blur' }],
  receiverPhone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  detailAddress: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
}

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

  // 当选择地址管理时，调用查询地址接口
  if (key === 'address') {
    if (userInfo.value.id && userInfo.value.id !== '未知') {
      fetchAddresses()
    } else {
      setTimeout(() => {
        if (userInfo.value.id && userInfo.value.id !== '未知') {
          fetchAddresses()
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

// 地址管理相关方法
const fetchAddresses = async () => {
  try {
    isLoadingAddresses.value = true
    const request = {
      userId: Number(userInfo.value.id),
      status: 1, // 只查询默认地址
      pageNum: addressPagination.value.pageNum,
      pageSize: addressPagination.value.pageSize,
    }
    const response = await userApi.queryAllUserAddress(request)
    if (response.data && response.data.data) {
      addresses.value = response.data.data
      addressPagination.value.total = response.data.total || 0
    } else {
      addresses.value = []
      addressPagination.value.total = 0
    }
  } catch (error: any) {
    console.error('获取地址列表失败:', error)
    ElMessage.error('获取地址列表失败')
    addresses.value = []
    addressPagination.value.total = 0
  } finally {
    isLoadingAddresses.value = false
  }
}

const editAddress = (address: any) => {
  // 填充编辑表单
  editAddressForm.value = {
    id: address.id,
    userId: address.userId,
    receiverName: address.receiverName,
    receiverPhone: address.receiverPhone,
    province: address.province,
    city: address.city,
    status: address.status,
    district: address.district || '',
    detailAddress: address.detailAddress,
    postalCode: address.postalCode || '',
  }
  showEditAddressDialog.value = true
}

const deleteAddress = async (addressId: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个地址吗？', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 调用删除地址的API
    const response = await userApi.removeUserAddress({
      id: addressId,
    })

    if (response.data !== undefined) {
      ElMessage.success('地址删除成功')
      // 重新获取地址列表
      await fetchAddresses()
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除地址失败:', error)
      if (error.message) {
        ElMessage.error(error.message)
      } else {
        ElMessage.error('删除地址失败，请重试')
      }
    }
  }
}

const setDefaultAddress = async (addressId: number) => {
  try {
    // 这里可以调用设置默认地址的API
    // await userApi.setDefaultAddress(addressId)

    ElMessage.success('设置默认地址成功')
    await fetchAddresses()
  } catch (error: any) {
    console.error('设置默认地址失败:', error)
    ElMessage.error('设置默认地址失败')
  }
}

// 保存编辑的地址
const saveEditAddress = async () => {
  try {
    // 表单验证
    await editAddressFormRef.value.validate()

    isSavingAddress.value = true

    const updateData = {
      id: editAddressForm.value.id,
      userId: editAddressForm.value.userId,
      receiverName: editAddressForm.value.receiverName,
      receiverPhone: editAddressForm.value.receiverPhone,
      province: editAddressForm.value.province,
      city: editAddressForm.value.city,
      status: editAddressForm.value.status,
      district: editAddressForm.value.district || null,
      detailAddress: editAddressForm.value.detailAddress,
      postalCode: editAddressForm.value.postalCode || null,
    }

    const response = await userApi.updateUserAddress(updateData)

    if (response.data) {
      ElMessage.success('地址更新成功')
      showEditAddressDialog.value = false
      // 重新获取地址列表
      await fetchAddresses()
    }
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      console.error('更新地址失败:', error)
      ElMessage.error('更新地址失败，请重试')
    }
  } finally {
    isSavingAddress.value = false
  }
}

// 取消新增地址
const cancelAddAddress = () => {
  showAddAddressDialog.value = false
  // 重置表单
  addAddressForm.value = {
    receiverName: '',
    receiverPhone: '',
    province: '',
    city: '',
    status: 1,
    district: '',
    detailAddress: '',
    postalCode: '',
  }
  // 清除表单验证
  if (addAddressFormRef.value) {
    addAddressFormRef.value.resetFields()
  }
}

// 保存新增的地址
const saveAddAddress = async () => {
  try {
    // 表单验证
    await addAddressFormRef.value.validate()

    isSavingAddress.value = true

    const addData = {
      userId: Number(userInfo.value.id),
      receiverName: addAddressForm.value.receiverName,
      receiverPhone: addAddressForm.value.receiverPhone,
      province: addAddressForm.value.province,
      city: addAddressForm.value.city,
      status: addAddressForm.value.status,
      district: addAddressForm.value.district || null,
      detailAddress: addAddressForm.value.detailAddress,
      postalCode: addAddressForm.value.postalCode || null,
    }

    const response = await userApi.addUserAddress(addData)

    if (response.data) {
      ElMessage.success('地址新增成功')
      showAddAddressDialog.value = false
      // 重置表单
      cancelAddAddress()
      // 重新获取地址列表
      await fetchAddresses()
    }
  } catch (error: any) {
    if (error.message) {
      ElMessage.error(error.message)
    } else {
      console.error('新增地址失败:', error)
      ElMessage.error('新增地址失败，请重试')
    }
  } finally {
    isSavingAddress.value = false
  }
}

// 地址分页相关方法
const handleAddressSizeChange = (val: number) => {
  addressPagination.value.pageSize = val
  addressPagination.value.pageNum = 1 // 切换每页大小时重置到第一页
  fetchAddresses()
}

const handleAddressCurrentChange = (val: number) => {
  addressPagination.value.pageNum = val
  fetchAddresses()
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

/* 地址管理样式 */
.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-header h2 {
  margin: 0;
}

.address-list {
  min-height: 300px;
}

.address-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.address-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
}

.address-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.default-address {
  border-color: #67c23a;
  background-color: #f0f9ff;
}

.address-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.address-info {
  flex: 1;
}

.receiver-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.receiver-name {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.receiver-phone {
  color: #606266;
  font-size: 14px;
}

.address-detail {
  color: #303133;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 8px;
}

.address-meta {
  display: flex;
  gap: 16px;
  color: #909399;
  font-size: 12px;
}

.address-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
</style>
