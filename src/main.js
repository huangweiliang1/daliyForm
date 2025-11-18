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

// 在应用挂载后初始化 store
const wordStore = useWordStore()

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