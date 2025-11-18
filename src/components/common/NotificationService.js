import { ElMessage, ElNotification } from 'element-plus'

// 统一的消息提示服务
export const NotificationService = {
  // 成功提示
  success(message, title = '成功') {
    ElMessage({
      type: 'success',
      message,
      duration: 3000
    })
  },

  // 错误提示
  error(message, title = '错误') {
    ElMessage({
      type: 'error',
      message,
      duration: 5000,
      showClose: true
    })
  },

  // 警告提示
  warning(message, title = '警告') {
    ElMessage({
      type: 'warning',
      message,
      duration: 4000
    })
  },

  // 信息提示
  info(message, title = '提示') {
    ElMessage({
      type: 'info',
      message,
      duration: 3000
    })
  },

  // 通知
  notify(message, title, type = 'info', duration = 4500) {
    ElNotification({
      title,
      message,
      type,
      duration,
      position: 'top-right'
    })
  },

  // 处理API错误
  handleApiError(error, fallbackMessage = '操作失败，请稍后重试') {
    console.error('API错误:', error)
    
    // 根据错误类型显示不同消息
    if (error.name === 'QuotaExceededError') {
      this.error('存储空间不足，请清理一些数据后重试')
    } else if (error.name === 'NetworkError' || error.message?.includes('network')) {
      this.error('网络连接错误，请检查您的网络连接')
    } else if (error.message) {
      this.error(error.message)
    } else {
      this.error(fallbackMessage)
    }
    
    return error
  }
}

// 导出默认实例
export default NotificationService