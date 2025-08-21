// 后端配置文件
export const BACKEND_CONFIG = {
  // 后端基础URL
  BASE_URL: 'http://localhost:8080',

  // 图片基础URL
  IMAGE_BASE_URL: 'http://localhost:8080',

  // 获取图片完整URL
  getImageUrl: (imagePath: string): string => {
    if (!imagePath || imagePath.trim() === '') {
      return 'https://picsum.photos/300/200?text=暂无图片'
    }

    // 如果已经是完整的URL，直接返回
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }

    // 拼接后端地址和图片路径
    return `${BACKEND_CONFIG.IMAGE_BASE_URL}${imagePath}`
  },
}

export default BACKEND_CONFIG
