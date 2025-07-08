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
    return response.data
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
    return api.post('/user/isRegister', { account })
  },

  // 用户注册
  register: (data: { username: string; password: string }) => {
    return api.post('/user/register', data)
  },

  // 用户登录
  login: (data: { username: string; password: string }) => {
    return api.post('/user/login', data)
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
