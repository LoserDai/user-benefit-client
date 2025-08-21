import { ENV_CONFIG } from './env'

// API配置文件
export const API_CONFIG = {
  // 后端基础URL
  BACKEND_BASE_URL: ENV_CONFIG.BACKEND_BASE_URL,

  // API前缀
  API_PREFIX: ENV_CONFIG.API_PREFIX,

  // 图片相关配置
  IMAGE: {
    // 图片基础URL
    BASE_URL: ENV_CONFIG.IMAGE_BASE_URL,

    // 默认图片
    DEFAULT_IMAGE: 'https://picsum.photos/300/200?random=1',

    // 图片路径处理
    getImageUrl: (imagePath: string): string => {
      if (!imagePath) return 'https://picsum.photos/300/200?random=1'

      // 如果已经是完整的URL，直接返回
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }

      // 如果是相对路径，拼接后端基础URL
      const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
      return `${ENV_CONFIG.IMAGE_BASE_URL}${normalizedPath}`
    },
  },
}

export default API_CONFIG
