import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import ErrorBoundary from './components/common/ErrorBoundary.vue'
import NotificationService from './components/common/NotificationService.js'
// 引入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 引入中文语言包
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
// 引入 wordStore
import { useWordStore } from './stores/wordStore'

// 全局音频助手类
class GlobalAudioHelper {
  constructor() {
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    this.isWeChat = /MicroMessenger/i.test(navigator.userAgent)
    this.isInitialized = false
  }

  async init() {
    if (this.isInitialized) return

    try {
      // 移动端特殊处理
      if (this.isMobile) {
        await this.setupMobileAudio()
      }
      
      this.isInitialized = true
      console.log('全局音频助手初始化完成')
    } catch (error) {
      console.warn('全局音频助手初始化失败:', error)
    }
  }

  async setupMobileAudio() {
    // 检查语音合成支持
    if (!('speechSynthesis' in window)) {
      console.warn('浏览器不支持语音合成')
      return
    }

    // 微信浏览器特殊处理
    if (this.isWeChat) {
      await this.activateWeChatAudio()
    }

    // 创建全局音频上下文
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) {
        const audioContext = new AudioContext()
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
        }
      }
    } catch (error) {
      console.warn('全局音频上下文创建失败:', error)
    }
  }

  async activateWeChatAudio() {
    return new Promise((resolve) => {
      try {
        // 创建静音音频来激活微信浏览器的音频上下文
        const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAAQAEAAEAfAAAQAQABAAgAZGF0YQAAAAA=')
        audio.volume = 0
        
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              audio.pause()
              resolve()
            })
            .catch(() => resolve())
        } else {
          setTimeout(() => {
            audio.pause()
            resolve()
          }, 100)
        }
      } catch (error) {
        console.warn('微信音频激活失败:', error)
        resolve()
      }
    })
  }

  // 全局用户交互处理
  async handleUserInteraction() {
    if (!this.isMobile) return true

    return new Promise((resolve) => {
      const activateAudio = async () => {
        try {
          // 播放静音音频来激活音频
          await this.activateWeChatAudio()
          
          document.removeEventListener('touchstart', activateAudio)
          document.removeEventListener('click', activateAudio)
          resolve(true)
        } catch (error) {
          console.warn('全局用户交互激活失败:', error)
          resolve(true)
        }
      }

      // 监听用户交互
      document.addEventListener('touchstart', activateAudio, { once: true })
      document.addEventListener('click', activateAudio, { once: true })
      
      // 超时处理
      setTimeout(() => {
        document.removeEventListener('touchstart', activateAudio)
        document.removeEventListener('click', activateAudio)
        resolve(true)
      }, 2000)
    })
  }
}

// 创建全局音频助手实例
const globalAudioHelper = new GlobalAudioHelper()

// 创建Vue应用实例
const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()

// 注册全局组件
app.component('ErrorBoundary', ErrorBoundary)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('全局错误:', err)
  console.error('错误信息:', info)
  console.error('组件实例:', vm)
  
  // 检查是否是环境变量相关错误
  if (err.message && err.message.includes('env')) {
    console.error('检测到环境变量错误，可能是依赖库配置问题')
    NotificationService.error('应用配置错误，请检查依赖库版本')
  } else {
    NotificationService.error('应用发生错误，请刷新页面重试')
  }
}

// 添加未捕获的Promise错误处理
window.addEventListener('unhandledrejection', (event) => {
  console.error('未捕获的Promise错误:', event.reason)
  if (event.reason && event.reason.message && event.reason.message.includes('env')) {
    NotificationService.error('应用配置错误，请检查依赖库版本')
  } else {
    NotificationService.error('应用发生未知错误')
  }
})

// 全局属性
app.config.globalProperties.$notify = NotificationService

// 使用Pinia插件
app.use(pinia)

// 使用Element Plus插件
app.use(ElementPlus, {
  locale: zhCn,
  // 添加安全配置
  size: 'default',
  zIndex: 3000
})

// 挂载应用到DOM
app.mount('#app')

// 在应用挂载后初始化 store 和音频助手
const wordStore = useWordStore()

// 初始化全局音频助手
globalAudioHelper.init().catch(error => {
  console.warn('全局音频助手初始化失败:', error)
})

// 添加初始化状态监听
wordStore.$onAction(({ name, after, onError }) => {
  if (name === 'initialize') {
    after(() => {
      console.log('Store初始化成功')
    })
    onError((error) => {
      console.error('Store初始化失败:', error)
    })
  }
})

// 初始化store
wordStore.initialize().catch(error => {
  console.error('Store初始化失败:', error)
  NotificationService.error('应用初始化失败，请刷新页面重试')
})

// 将全局音频助手添加到Vue实例属性中
app.config.globalProperties.$audioHelper = globalAudioHelper