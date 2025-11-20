<template>
  <div id="app">
    <ErrorBoundary>
      <LoadingOverlay v-if="isLoading" :text="loadingText" />
      <el-container class="container" v-if="!isMobile">
      <!-- 现代化侧边栏 -->
      <el-aside class="sidebar" width="280px">
        <div class="sidebar-header">
          <div class="brand">
            <div class="brand-icon">📚</div>
            <div class="brand-text">
              <h2>英语学习</h2>
              <span>Daily English</span>
            </div>
          </div>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-section">
            <div class="nav-section-title">学习功能</div>
            <div 
              class="nav-item" 
              :class="{ active: currentTab === 'add' }"
              @click="switchTab('add')"
            >
              <div class="nav-icon">
                <el-icon><Plus /></el-icon>
              </div>
              <span>添加单词</span>
              <div class="nav-badge" v-if="todayWords > 0">{{ todayWords }}</div>
            </div>
            
            <div 
              class="nav-item" 
              :class="{ active: currentTab === 'view' }"
              @click="switchTab('view')"
            >
              <div class="nav-icon">
                <el-icon><View /></el-icon>
              </div>
              <span>单词记录</span>
              <div class="nav-count">{{ totalWords }}</div>
            </div>
            
            <div 
              class="nav-item" 
              :class="{ active: currentTab === 'search' }"
              @click="switchTab('search')"
            >
              <div class="nav-icon">
                <el-icon><Search /></el-icon>
              </div>
              <span>搜索单词</span>
            </div>
            
            <div 
              class="nav-item" 
              :class="{ active: currentTab === 'practice' }"
              @click="switchTab('practice')"
            >
              <div class="nav-icon">
                <el-icon><EditPen /></el-icon>
              </div>
              <span>单词练习</span>
            </div>
            
            <div 
              class="nav-item" 
              :class="{ active: currentTab === 'diary' }"
              @click="switchTab('diary')"
            >
              <div class="nav-icon">
                <el-icon><Document /></el-icon>
              </div>
              <span>学习日记</span>
            </div>
          </div>
          
          <div class="nav-section">
            <div class="nav-section-title">数据分析</div>
            <div 
              class="nav-item" 
              :class="{ active: currentTab === 'stats' }"
              @click="switchTab('stats')"
            >
              <div class="nav-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <span>学习统计</span>
            </div>
          </div>
          
          <div class="nav-section">
            <div class="nav-section-title">数据管理</div>
            <div class="nav-item" @click="handleDataCommand('import')">
              <div class="nav-icon">
                <el-icon><Upload /></el-icon>
              </div>
              <span>导入数据</span>
            </div>
            <div class="nav-item" @click="handleDataCommand('export')">
              <div class="nav-icon">
                <el-icon><Download /></el-icon>
              </div>
              <span>导出数据</span>
            </div>
            <div class="nav-item danger" @click="handleDataCommand('clear')">
              <div class="nav-icon">
                <el-icon><Delete /></el-icon>
              </div>
              <span>清空数据</span>
            </div>
          </div>
        </nav>
        
        <div class="sidebar-footer">
          <div class="user-stats">
            <div class="stat-card">
              <div class="stat-value">{{ studyDays }}</div>
              <div class="stat-label">学习天数</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">{{ totalWords }}</div>
              <div class="stat-label">总单词数</div>
            </div>
          </div>
        </div>
      </el-aside>

      <!-- 主内容区域 -->
      <el-container class="main-container">
        <el-header class="main-header">
          <div class="header-left">
            <h1 class="page-title">{{ getPageTitle }}</h1>
            <div class="breadcrumb">
              <span>英语学习</span>
              <el-icon><ArrowRight /></el-icon>
              <span>{{ getPageTitle }}</span>
            </div>
          </div>
          <div class="header-right">
            <div class="quick-stats" v-if="currentTab === 'add'">
              <div class="quick-stat">
                <span class="label">今日已学</span>
                <span class="value">{{ todayWords }}</span>
              </div>
            </div>
            <el-button type="primary" size="small" @click="switchToTabAndCloseMenu('add')">
              <el-icon><Plus /></el-icon>
              添加单词
            </el-button>
            <el-dropdown @command="handleDataCommand">
              <el-button size="small" text>
                <el-icon><More /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="import">
                    <el-icon><Upload /></el-icon>
                    导入数据
                  </el-dropdown-item>
                  <el-dropdown-item command="export">
                    <el-icon><Download /></el-icon>
                    导出数据
                  </el-dropdown-item>
                  <el-dropdown-item command="clear" divided>
                    <el-icon><Delete /></el-icon>
                    清空数据
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="primary" size="small" @click="refreshStats">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </el-header>
        
        <el-main class="main-content">
          <div class="content-wrapper">
            <div class="content-card">
              <transition name="fade-slide" mode="in-out">
                <AddWord v-if="currentTab === 'add'" />
                <ViewWords 
                  v-else-if="currentTab === 'view'" 
                  :show-stats="showStats" 
                  @data-updated="refreshStats" 
                  @switch-to-add="switchTab('add')" 
                  @edit-word="editWord"
                />
                <SearchWords v-else-if="currentTab === 'search'" />
                <PracticeWords v-else-if="currentTab === 'practice'" />
                <Diary v-else-if="currentTab === 'diary'" />
                <StatsView v-else-if="currentTab === 'stats'" />
              </transition>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-container>
        
    <!-- 移动端主界面 -->
    <div v-if="isMobile && currentTab === 'add'" class="mobile-main">
      <!-- 移动端顶部状态栏 -->
      <div class="mobile-header">
        <div class="mobile-stats">
          <div class="stat-item">
            <div class="stat-number">{{ totalWords }}</div>
            <div class="stat-label">单词</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ todayWords }}</div>
            <div class="stat-label">今日</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ studyDays }}</div>
            <div class="stat-label">天数</div>
          </div>
        </div>
        <div class="mobile-title">
          <h1>英语学习日记</h1>
        </div>
      </div>

      <!-- 移动端添加单词区域 -->
      <div class="mobile-add-section">
        <AddWord />
      </div>
    </div>

    <!-- 移动端内容区域 -->
    <div v-if="isMobile && currentTab !== 'add'" class="mobile-content">
      <transition name="fade">
        <div v-show="contentVisible">
          <AddWord v-if="currentTab === 'add'" />
          <ViewWords :show-stats="showStats" v-else-if="currentTab === 'view'" @data-updated="refreshStats" @switch-to-add="switchTab('add')" />
          <SearchWords v-else-if="currentTab === 'search'" />
          <PracticeWords v-else-if="currentTab === 'practice'" />
          <Diary v-else-if="currentTab === 'diary'" />
          <StatsView v-else-if="currentTab === 'stats'" />
        </div>
      </transition>
    </div>

    <!-- 移动端底部导航 -->
    <div class="mobile-nav" v-if="isMobile">
      <div 
        class="mobile-nav-item" 
        :class="{ active: currentTab === 'add' }"
        @click="switchTab('add')"
      >
        <div class="nav-icon-wrapper">
          <el-icon><Plus /></el-icon>
        </div>
        <span>添加</span>
      </div>
      <div 
        class="mobile-nav-item" 
        :class="{ active: currentTab === 'view' || currentTab === 'search' }"
        @click="switchTab('view')"
      >
        <div class="nav-icon-wrapper">
          <el-icon><View /></el-icon>
        </div>
        <span>单词</span>
      </div>
      <div 
        class="mobile-nav-item" 
        :class="{ active: currentTab === 'practice' }"
        @click="switchTab('practice')"
      >
        <div class="nav-icon-wrapper">
          <el-icon><EditPen /></el-icon>
        </div>
        <span>练习</span>
      </div>
      <div 
        class="mobile-nav-item" 
        :class="{ active: currentTab === 'diary' }"
        @click="switchTab('diary')"
      >
        <div class="nav-icon-wrapper">
          <el-icon><Document /></el-icon>
        </div>
        <span>日记</span>
      </div>
      <div 
        class="mobile-nav-item" 
        @click="showMobileMenu = true"
      >
        <div class="nav-icon-wrapper">
          <el-icon><Menu /></el-icon>
        </div>
        <span>更多</span>
      </div>
    </div>

    <!-- 移动端更多菜单 -->
    <el-drawer 
      v-model="showMobileMenu" 
      title="更多功能" 
      direction="btt"
      size="60%"
    >
      <div class="mobile-more-menu">
        <div class="menu-section">
          <h3>学习功能</h3>
          <el-button 
            type="primary" 
            @click="switchToTabAndCloseMenu('stats')" 
            style="width: 100%; margin-bottom: 10px;"
            :class="{ 'is-active': currentTab === 'stats' }"
          >
            <el-icon><TrendCharts /></el-icon>
            学习统计
          </el-button>
          <el-button 
            type="info" 
            @click="switchToTabAndCloseMenu('search')" 
            style="width: 100%; margin-bottom: 10px;"
            :class="{ 'is-active': currentTab === 'search' }"
          >
            <el-icon><Search /></el-icon>
            搜索单词
          </el-button>
        </div>
        
        <div class="menu-section">
          <h3>数据管理</h3>
          <el-button type="success" @click="triggerImport" style="width: 100%; margin-bottom: 10px;">
            <el-icon><Upload /></el-icon>
            导入数据
          </el-button>
          <el-button type="warning" @click="exportData" style="width: 100%; margin-bottom: 10px;">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
          <el-button type="danger" @click="clearData" style="width: 100%;">
            <el-icon><Delete /></el-icon>
            清空数据
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 移动端数据管理菜单 -->
    <el-drawer 
      v-model="showMobileDataMenu" 
      title="数据管理" 
      direction="btt"
      size="200px"
    >
      <div class="mobile-data-menu">
        <el-button type="primary" @click="triggerImport" style="width: 100%; margin-bottom: 10px;">
          <el-icon><Upload /></el-icon>
          导入数据
        </el-button>
        <el-button type="success" @click="exportData" style="width: 100%; margin-bottom: 10px;">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        <el-button type="danger" @click="clearData" style="width: 100%;">
          <el-icon><Delete /></el-icon>
          清空数据
        </el-button>
      </div>
    </el-drawer>

    <!-- 隐藏的文件输入 -->
    <input 
      ref="fileInput" 
      type="file" 
      accept=".json" 
      style="display: none" 
      @change="handleImport"
    />
    </ErrorBoundary>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, provide } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { 
  Plus, 
  View, 
  Search, 
  EditPen, 
  Document, 
  TrendCharts, 
  Setting,
  ArrowDown,
  ArrowRight,
  Refresh,
  Upload,
  Download,
  Delete,
  Menu,
  More
} from '@element-plus/icons-vue'
import { useWordStore } from './stores/wordStore'
import NotificationService from './components/common/NotificationService'

// 导入组件
import AddWord from './components/AddWord.vue'
import ViewWords from './components/ViewWords.vue'
import SearchWords from './components/SearchWords.vue'
import PracticeWords from './components/PracticeWords.vue'
import Diary from './components/Diary.vue'
import StatsView from './components/StatsView.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'

export default {
  name: 'App',
  components: {
    AddWord,
    ViewWords,
    SearchWords,
    PracticeWords,
    Diary,
    StatsView,
    LoadingOverlay,
    // 注册图标组件
    Plus,
    View,
    Search,
    EditPen,
    Document,
    TrendCharts,
    Setting,
    ArrowDown,
    ArrowRight,
    Refresh,
    Upload,
    Download,
    Delete,
    Menu,
    More
  },
  setup() {
    // 状态管理
    const currentTab = ref('add')
    const fileInput = ref(null)
    const windowWidth = ref(window.innerWidth)
    const contentVisible = ref(true)
    const showStats = ref(false)
    const showMobileDataMenu = ref(false)
    const showMobileMenu = ref(false)
    
    // 加载状态
    const isLoading = ref(false)
    const loadingText = ref('加载中...')
    
    // 每日目标设置
    const savedTarget = localStorage.getItem('dailyEnglishTarget')
    const dailyTarget = ref(savedTarget ? parseInt(savedTarget) : 20)
    
    // 判断是否为移动端
    const isMobile = computed(() => windowWidth.value <= 768)

    // 获取wordStore
    const wordStore = useWordStore()
    
    // 单词数据
    const words = computed(() => wordStore.words)

    // 计算统计数据
    const totalWords = computed(() => wordStore.totalWords)
    const todayWords = computed(() => wordStore.todayWords)
    const studyDays = computed(() => wordStore.studyDays)

    // 获取当前组件
    const getCurrentComponent = computed(() => {
      const components = {
        add: AddWord,
        view: ViewWords,
        search: SearchWords,
        practice: PracticeWords,
        diary: Diary,
        stats: StatsView
      }
      return components[currentTab.value] || AddWord
    })

    // 获取页面标题
    const getPageTitle = computed(() => {
      const titles = {
        add: '添加单词',
        view: '查看记录',
        search: '搜索单词',
        practice: '单词练习',
        diary: '学习日记',
        stats: '学习统计'
      }
      return titles[currentTab.value] || '英语学习日记'
    })
    
    // 错误处理函数
    const handleError = (error, context = '') => {
      console.error(`应用错误 ${context}:`, error)
      showNotification(`操作失败: ${error.message || '未知错误'}`, 'error')
    }
    
    // 切换标签页动画
    const switchTab = (tab) => {
      try {
        contentVisible.value = false
        setTimeout(() => {
          currentTab.value = tab
          setTimeout(() => {
            contentVisible.value = true
          }, 50)
        }, 200)
      } catch (error) {
        handleError(error, '切换标签页')
        contentVisible.value = true
      }
    }
    
    // 编辑单词
    const editWord = (word) => {
      // 切换到添加页面并传递单词数据
      currentTab.value = 'add'
      // 可以通过事件总线或其他方式传递单词数据
      setTimeout(() => {
        // 触发编辑事件
        window.dispatchEvent(new CustomEvent('edit-word', { detail: word }))
      }, 300)
    }
    
    // 切换到指定标签页（用于移动端菜单）
    const switchToTabAndCloseMenu = (tab) => {
      try {
        showMobileMenu.value = false
        switchTab(tab)
      } catch (error) {
        handleError(error, '切换标签页并关闭菜单')
      }
    }
    
    // 标签页离开前的钩子
    const beforeTabLeave = () => {
      contentVisible.value = false
      return new Promise(resolve => {
        setTimeout(() => {
          contentVisible.value = true
          resolve()
        }, 200)
      })
    }
    
    // 标签页点击事件
    const onTabClick = () => {
      if (currentTab.value === 'view') {
        setTimeout(() => {
          showStats.value = true
        }, 300)
      }
    }

    // 显示通知
    const showNotification = (message, type = 'success') => {
      NotificationService.notify(message, '', type)
    }
    
    // 窗口大小变化处理
    const handleResize = () => {
      windowWidth.value = window.innerWidth
    }
    
    // 监听标签页变化
    watch(currentTab, (newTab) => {
      if (newTab === 'view') {
        setTimeout(() => {
          showStats.value = true
        }, 300)
      }
    })
    
    onMounted(async () => {
      try {
        window.addEventListener('resize', handleResize)
        
        // 从localStorage读取保存的每日目标
        const savedTarget = localStorage.getItem('dailyEnglishTarget')
        if (savedTarget) {
          dailyTarget.value = parseInt(savedTarget)
        }
        
        // 确保wordStore已初始化
        if (!wordStore.initialized) {
          await wordStore.initialize()
        }
        
        // 延迟显示统计信息
        setTimeout(() => {
          showStats.value = true
        }, 500)
      } catch (error) {
        handleError(error, '应用初始化')
        // 即使出错也要确保界面可用
        setTimeout(() => {
          showStats.value = true
        }, 500)
      }
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
    })

    // 刷新统计和所有数据
    const refreshStats = async () => {
      try {
        await wordStore.loadFromDB()
        showNotification('数据已刷新', 'success')
      } catch (error) {
        console.error('刷新数据失败:', error)
        showNotification('刷新数据失败', 'error')
      }
    }

    // 导出数据
    const exportData = async () => {
      try {
        isLoading.value = true
        loadingText.value = '导出中...'
        
        const dataToExport = await wordStore.exportData()
        
        const dataStr = JSON.stringify(dataToExport, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `english_learning_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        URL.revokeObjectURL(url)
        showNotification('数据导出成功', 'success')
      } catch (error) {
        console.error('导出数据失败:', error)
        showNotification('导出数据失败', 'error')
      } finally {
        isLoading.value = false
      }
    }

    // 触发文件选择
    const triggerImport = () => {
      fileInput.value?.click()
      showMobileDataMenu.value = false
    }

    // 获取今天的日期字符串
    const getTodayDateString = () => {
      return new Date().toISOString().split('T')[0]
    }

    // 导入数据
    const handleImport = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          isLoading.value = true
          loadingText.value = '导入中...'
          
          const importedData = JSON.parse(e.target.result)
          let wordsImported = 0
          
          // 标准化导入数据格式
          let importFormat = {};
          
          if (importedData.words && importedData.diaries) {
            importFormat = {
              words: importedData.words,
              diaries: importedData.diaries
            }
          } else if (Array.isArray(importedData)) {
            importFormat = {
              words: importedData.map(word => ({
                id: word.id || Date.now() + Math.random().toString(36).substr(2, 9),
                word: word.word || word.name || word.wordName || '',
                meaning: word.meaning || word.definition || word.translation || '',
                phonetic: word.phonetic || word.pronunciation || '',
                example: word.example || word.sample || '',
                tags: word.tags || [],
                date: word.date || getTodayDateString(),
                reviewCount: word.reviewCount || 0,
                mastered: word.mastered || false
              })).filter(word => word.word && word.meaning),
              diaries: {}
            }
          } else {
            throw new Error('无效的数据格式')
          }
          
          const success = await wordStore.importData(importFormat)
          
          if (success) {
            const beforeCount = wordStore.totalWords - (importFormat.words?.length || 0)
            wordsImported = wordStore.totalWords - beforeCount
            showNotification(`成功导入 ${wordsImported} 个单词`, 'success')
          } else {
            throw new Error('导入过程中出现错误')
          }
          
          event.target.value = ''
          showMobileDataMenu.value = false
        } catch (error) {
          console.error('导入数据失败:', error)
          showNotification('数据导入失败：' + error.message, 'error')
        } finally {
          isLoading.value = false
        }
      }
      reader.readAsText(file)
    }

    // 清空数据
    const clearData = async () => {
      if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
        try {
          isLoading.value = true
          loadingText.value = '清空数据中...'
          
          const success = await wordStore.clearAllData()
          
          if (success) {
            showNotification('所有数据已清空', 'warning')
          } else {
            throw new Error('清空操作未能完全成功')
          }
        } catch (error) {
          console.error('清空数据失败:', error)
          showNotification('清空数据失败', 'error')
        } finally {
          isLoading.value = false
        }
      }
      showMobileDataMenu.value = false
    }

    // 处理数据管理命令
    const handleDataCommand = (command) => {
      switch (command) {
        case 'import':
          triggerImport()
          break
        case 'export':
          exportData()
          break
        case 'clear':
          clearData()
          break
      }
    }

    // 提供全局加载状态控制
    provide('loading', {
      show: (text = '加载中...') => {
        loadingText.value = text
        isLoading.value = true
      },
      hide: () => {
        isLoading.value = false
      }
    })
    
    return {
      currentTab,
      fileInput,
      totalWords,
      todayWords,
      studyDays,
      isMobile,
      contentVisible,
      showStats,
      isLoading,
      loadingText,
      showMobileDataMenu,
      showMobileMenu,
      getPageTitle,
      getCurrentComponent,
      words,
      switchTab,
      switchToTabAndCloseMenu,
      showNotification,
      handleError,
      refreshStats,
      exportData,
      triggerImport,
      handleImport,
      clearData,
      beforeTabLeave,
      onTabClick,
      handleDataCommand
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 100%;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  position: relative;
  background: #f8fafc;
  display: flex;
  overflow: hidden;
}

/* PC端背景装饰 */
.container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.03) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}

/* 侧边栏样式 */
.sidebar {
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.08);
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  text-decoration: none;
  transition: all 0.3s ease;
}

.logo:hover {
  color: #3b82f6;
  transform: translateX(2px);
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: 32px;
}

.nav-section-title {
  padding: 0 20px 8px 20px;
  font-size: 11px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
}

.nav-item:hover {
  background: #f9fafb;
  color: #374151;
  padding-left: 24px;
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
  color: #3b82f6;
  border-left: 3px solid #3b82f6;
  padding-left: 17px;
  font-weight: 600;
}

.nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-text {
  flex: 1;
}

.nav-badge {
  background: #e5e7eb;
  color: #6b7280;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.nav-item.active .nav-badge {
  background: #3b82f6;
  color: white;
}

.sidebar-stats {
  padding: 20px;
  border-top: 1px solid #f3f4f6;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
}

.stats-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stats-title {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 10px;
  color: #9ca3af;
  font-weight: 500;
}

/* 主内容区域 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 280px;
  height: 100vh;
  overflow: hidden;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.main-header {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quick-stats {
  display: flex;
  gap: 16px;
  padding-right: 16px;
  border-right: 1px solid #e5e7eb;
}

.quick-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quick-stat .label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
}

.quick-stat .value {
  font-size: 18px;
  font-weight: 700;
  color: #3b82f6;
}

.main-content {
  flex: 1;
  overflow: hidden;
  background: #f8fafc;
}

.content-wrapper {
  height: 100%;
  padding: 24px;
  overflow-y: auto;
}

.content-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  min-height: calc(100vh - 140px);
  transition: all 0.3s ease;
}

/* 页面切换动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 侧边栏动画 */
.sidebar {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item {
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.nav-item:hover::before {
  left: 100%;
}

/* 统计卡片动画 */
.stats-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-value {
  transition: all 0.2s ease;
}

.stats-card:hover .stat-value {
  transform: scale(1.05);
  color: #3b82f6;
}

/* Logo动画 */
.logo {
  position: relative;
}

.logo-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo:hover .logo-icon {
  transform: rotate(360deg) scale(1.1);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

/* 响应式优化 */
@media (max-width: 1024px) {
  .sidebar {
    width: 260px;
  }
  
  .main-container {
    margin-left: 260px;
  }
  
  .main-header {
    padding: 14px 24px;
  }
  
  .page-title {
    font-size: 20px;
  }
  
  .content-wrapper {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    z-index: 1001;
    width: 280px;
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .main-container {
    margin-left: 0;
  }
  
  .main-header {
    padding: 12px 16px;
  }
  
  .page-title {
    font-size: 18px;
  }
  
  .breadcrumb {
    display: none;
  }
  
  .quick-stats {
    display: none;
  }
  
  .content-wrapper {
    padding: 16px;
  }
  
  .header-right .el-button {
    padding: 6px 12px;
    font-size: 12px;
  }
}

/* 滚动条美化 */
.sidebar::-webkit-scrollbar,
.content-wrapper::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track,
.content-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb,
.content-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
  transition: background 0.2s ease;
}

.sidebar::-webkit-scrollbar-thumb:hover,
.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 导航项交互优化 */
.nav-item {
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.5s ease;
}

.nav-item:hover::before {
  left: 100%;
}

/* Logo动画优化 */
.logo-icon {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo:hover .logo-icon {
  transform: rotate(360deg) scale(1.1);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

/* 统计卡片动画 */
.stats-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-value {
  transition: all 0.2s ease;
}

.stats-card:hover .stat-value {
  transform: scale(1.05);
  color: #3b82f6;
}

/* 现代化配色主题 */
:root {
  --primary-gradient: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --secondary-color: #8b5cf6;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f3f4f6;
  --border-color: #e5e7eb;
  --border-hover: #d1d5db;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* 微交互效果 */
.nav-item {
  position: relative;
  overflow: hidden;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--primary-gradient);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(-50%);
}

.nav-item:hover::after {
  width: 80%;
}

.nav-item.active::after {
  width: 100%;
}

/* 面包屑动画 */
.breadcrumb-item {
  position: relative;
  transition: all 0.2s ease;
}

.breadcrumb-item:hover {
  transform: translateY(-1px);
}

/* 统计数字动画 */
@keyframes countUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-value {
  animation: countUp 0.6s ease-out;
}

/* 加载状态动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading .stat-value {
  animation: pulse 1.5s ease-in-out infinite;
}

/* 悬浮卡片效果 */
.content-card {
  position: relative;
  overflow: hidden;
}

.content-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.6s;
  pointer-events: none;
}

.content-card:hover::before {
  left: 100%;
}

/* 按钮点击波纹效果 */
:deep(.el-button) {
  position: relative;
  overflow: hidden;
}

:deep(.el-button)::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

:deep(.el-button:active)::after {
  width: 200px;
  height: 200px;
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  :root {
    --text-primary: #f9fafb;
    --text-secondary: #d1d5db;
    --text-muted: #9ca3af;
    --bg-primary: #1f2937;
    --bg-secondary: #111827;
    --bg-tertiary: #374151;
    --border-color: #4b5563;
    --border-hover: #6b7280;
  }
  
  .container {
    background: var(--bg-secondary);
  }
  
  .sidebar {
    background: var(--bg-primary);
    border-right-color: var(--border-color);
  }
  
  .content-header {
    background: var(--bg-primary);
    border-bottom-color: var(--border-color);
  }
  
  .content-card {
    background: var(--bg-primary);
    border-color: var(--border-color);
  }
}

/* 现代化Element Plus组件样式覆盖 */
:deep(.el-dropdown) {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

:deep(.el-dropdown:hover) {
  color: #fff;
}

:deep(.el-dropdown-menu) {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 8px;
  min-width: 180px;
  backdrop-filter: blur(10px);
}

:deep(.el-dropdown-menu__item) {
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item:hover) {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: #fff;
  transform: translateX(2px);
}

:deep(.el-dropdown-menu__item.is-divided) {
  border-top: 1px solid #f3f4f6;
  margin-top: 4px;
  padding-top: 12px;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  letter-spacing: 0.025em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

:deep(.el-button--small) {
  padding: 8px 16px;
  font-size: 13px;
}

:deep(.el-button.is-text) {
  color: #6b7280;
  border: 1px solid #e5e7eb;
  background: #fff;
}

:deep(.el-button.is-text:hover) {
  color: #3b82f6;
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

/* 移动端导航 */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(20px);
  border-top: 1px solid #e4e7ed;
  display: flex;
  padding: 6px 0 max(6px, env(safe-area-inset-bottom));
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.mobile-nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 2px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 10px;
  color: #666;
  position: relative;
  min-height: 44px;
  justify-content: center;
}

.mobile-nav-item.active {
  color: #409eff;
  transform: translateY(-2px);
}

.mobile-nav-item.active::before {
  content: '';
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background: #409eff;
  border-radius: 2px;
}

.nav-icon-wrapper {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
  transition: all 0.3s;
}

.mobile-nav-item:hover .nav-icon-wrapper {
  transform: scale(1.1);
}

.mobile-nav-item.active .nav-icon-wrapper {
  color: #409eff;
}

.mobile-data-menu {
  padding: 20px;
}

.mobile-more-menu {
  padding: 20px;
}

.mobile-content {
  padding: 16px 12px 100px;
  min-height: calc(100vh - 60px);
  background: #f8fafc;
}

/* 移动端专用优化 */
@media (max-width: 768px) {
  /* 确保内容不被底部导航遮挡 */
  .mobile-content {
    padding-bottom: max(100px, calc(60px + env(safe-area-inset-bottom)));
  }
  
  /* 优化滚动体验 */
  .mobile-content {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  
  /* 触摸优化 */
  * {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
  
  /* 允许文本选择 */
  .word-meaning,
  .word-example,
  .word-text {
    -webkit-user-select: text;
    user-select: text;
  }
  
  /* 优化按钮触摸区域 */
  .mobile-nav-item {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* 优化输入框在移动端的显示 */
  :deep(.el-input__inner) {
    font-size: 16px; /* 防止iOS缩放 */
  }
  
  /* 优化对话框在移动端的显示 */
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 0 auto !important;
    max-height: 80vh;
    overflow-y: auto;
  }
  
  /* 优化抽屉在移动端的显示 */
  :deep(.el-drawer) {
    border-radius: 16px 16px 0 0;
  }
  
  /* 优化按钮在移动端的尺寸 */
  :deep(.el-button--small) {
    min-height: 32px;
    padding: 6px 12px;
  }
  
  /* 优化统计数字显示 */
  .stat-number {
    font-size: 20px;
    font-weight: 700;
  }
  
  .stat-label {
    font-size: 11px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 375px) {
  .mobile-content {
    padding: 12px 8px max(100px, calc(60px + env(safe-area-inset-bottom)));
  }
  
  .mobile-nav-item {
    font-size: 9px;
  }
  
  .nav-icon-wrapper {
    width: 18px;
    height: 18px;
  }
  
  .stat-number {
    font-size: 18px;
  }
  
  .stat-label {
    font-size: 10px;
  }
}

/* 横屏模式优化 */
@media (max-width: 768px) and (orientation: landscape) {
  .mobile-nav {
    padding: 2px 0 max(2px, env(safe-area-inset-bottom));
  }
  
  .mobile-nav-item {
    padding: 2px 1px;
    min-height: 40px;
  }
  
  .nav-icon-wrapper {
    width: 18px;
    height: 18px;
    margin-bottom: 1px;
  }
  
  .mobile-content {
    padding-bottom: max(80px, calc(50px + env(safe-area-inset-bottom)));
  }
}

/* 移动端数据管理菜单 */
.mobile-data-menu {
  padding: 16px;
}

.mobile-more-menu {
  padding: 16px;
}

/* 移动端主界面样式 */
.mobile-main {
  padding: 16px 12px 80px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.mobile-main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.mobile-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.mobile-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 16px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
  color: white;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
  font-weight: 500;
}

.mobile-title h1 {
  color: white;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
}

.mobile-add-section {
  position: relative;
  z-index: 1;
  padding: 0 5px;
}

.mobile-add-section :deep(.el-card) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.mobile-add-section :deep(.el-form-item__label) {
  color: #303133;
  font-weight: 600;
}

.mobile-add-section :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(64, 158, 255, 0.2);
  transition: all 0.3s;
}

.mobile-add-section :deep(.el-input__wrapper:hover) {
  border-color: rgba(64, 158, 255, 0.4);
}

.mobile-add-section :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.menu-section {
  margin-bottom: 30px;
}

.menu-section h3 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.menu-section .el-button.is-active {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 20px 10px 80px 10px;
  }
  
  :deep(.el-tabs__header) {
    margin-bottom: 10px;
  }
  
  :deep(.el-tabs__item) {
    padding: 0 10px;
    font-size: 14px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 15px;
  }
  
  :deep(.el-button) {
    padding: 8px 15px;
  }
  
  :deep(.el-card) {
    margin-bottom: 10px;
  }
}

/* PC端响应式设计 */
@media (min-width: 769px) {
  .container {
    padding: 1.5rem;
  }
  
  .tabs {
    margin-top: 0;
  }
  
  :deep(.el-tabs__content) {
    padding: 24px;
    min-height: 500px;
  }
  
  .header-content {
    padding: 1.5rem;
  }
  
  .app-title h1 {
    font-size: 1.8rem;
  }
  
  .title-icon {
    width: 56px;
    height: 56px;
    font-size: 1.6rem;
  }
}

@media (max-width: 1024px) {
  .header-content {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-stats {
    justify-content: center;
  }
}

@media (max-width: 900px) {
  :deep(.el-tabs__item) {
    padding: 0 16px;
    font-size: 14px;
  }
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* App特定样式 */
.app-header-card {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
  transition: transform 0.3s ease;
  animation: statSlideIn 0.8s ease;
}

.app-header-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.app-header-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
}

.header-content {
  position: relative;
  z-index: 1;
  padding: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.2rem;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  position: relative;
}

.title-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  animation: rotate 20s linear infinite;
  position: relative;
  overflow: hidden;
}

.app-title h1 {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
  position: relative;
  background: linear-gradient(90deg, #ffffff, rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.header-stats {
  display: flex;
  gap: 1.2rem;
}

:deep(.el-statistic) {
  text-align: center;
}

:deep(.el-statistic__head) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
}

:deep(.el-statistic__content) {
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes statSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 触摸优化 */
@media (hover: none) {
  :deep(.el-button),
  :deep(.el-tabs__item),
  :deep(.el-input),
  :deep(.el-select) {
    touch-action: manipulation;
  }
  
  :deep(.el-button) {
    min-height: 44px;
  }
  
  .mobile-nav-item {
    padding: 10px 0;
  }
  
  .nav-icon-wrapper {
    width: 52px;
    height: 52px;
  }
}
</style>
