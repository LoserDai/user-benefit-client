// 环境配置文件
interface EnvConfig {
  BACKEND_BASE_URL: string
  API_PREFIX: string
  IMAGE_BASE_URL: string
}

// 根据当前环境获取配置
const getEnvConfig = (): EnvConfig => {
  const isDev = import.meta.env.DEV
  const isProd = import.meta.env.PROD

  if (isDev) {
    // 开发环境
    return {
      BACKEND_BASE_URL: 'http://localhost:8080',
      API_PREFIX: '/api',
      IMAGE_BASE_URL: 'http://localhost:8080',
    }
  } else if (isProd) {
    // 生产环境 - 这里需要根据实际部署情况调整
    return {
      BACKEND_BASE_URL: window.location.origin,
      API_PREFIX: '/api',
      IMAGE_BASE_URL: window.location.origin,
    }
  }

  // 默认配置
  return {
    BACKEND_BASE_URL: 'http://localhost:8080',
    API_PREFIX: '/api',
    IMAGE_BASE_URL: 'http://localhost:8080',
  }
}

export const ENV_CONFIG = getEnvConfig()

export default ENV_CONFIG
