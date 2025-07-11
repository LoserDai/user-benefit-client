import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api', // 使用代理路径
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // 不发送cookies
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.method?.toUpperCase(), config.url, config.data)
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.status, response.data)
    const data = response.data

    // 检查业务状态码
    if (data.code && data.code !== 200) {
      // 业务错误，抛出异常
      const error = new Error(data.message || '请求失败') as any
      error.response = response
      error.code = data.code
      return Promise.reject(error)
    }

    return data
  },
  (error) => {
    console.error('API请求错误:', error)
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('错误状态码:', error.response.status)
      console.error('错误数据:', error.response.data)
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误:', error.request)
    } else {
      // 其他错误
      console.error('请求配置错误:', error.message)
    }
    return Promise.reject(error)
  },
)

// 用户相关接口
export const userApi = {
  // 检查用户名是否已注册
  checkUsername: (account: string) => {
    return api.get(`/user/isRegister?account=${encodeURIComponent(account)}`)
  },

  // 用户注册
  register: (data: { account: string; password: string; checkPassword: string }) => {
    return api.post('/user/register', data)
  },

  // 用户登录
  login: (data: { account: string; password: string }) => {
    return api.post('/user/login', data)
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    return api.get('/user/current')
  },

  // 更新用户信息
  updateUser: (data: {
    id: string
    account: string
    email: string
    phone: string
    gender: number
    status: string
  }) => {
    return api.post('/user/update', data)
  },

  // 查询积分和余额
  queryPoints: () => {
    return api.post('/points/query')
  },
}

// 产品相关接口
export const productApi = {
  // 查询所有产品
  queryAllProduct: (params: {
    maxPrice: number
    minPrice: number
    pageNum: number
    pageSize: number
    productName: string
    sortField: string
    sortOrder: string
    status: string
  }) => {
    return api.post('/product/queryAllProduct', params)
  },
}

export default api
