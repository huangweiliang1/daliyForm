<template>
  <div class="diary-container">
    <!-- 背景装饰元素 -->
    <div class="bg-gradient"></div>
    <div class="bg-circle"></div>
    <div class="bg-circle"></div>
    
    <!-- 页面头部 -->
    <header class="diary-header">
      <div class="header-content">
        <div class="header-title">
          <h1>学习日记</h1>
          <p class="header-subtitle">记录每一天的学习成长</p>
        </div>
        <div class="header-stats">
          <div class="stat-card">
            <div class="stat-number">{{ totalDiaries }}</div>
            <div class="stat-label">日记总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ currentStreak }}</div>
            <div class="stat-label">连续天数</div>
          </div>
        </div>
      </div>
    </header>
    
    <!-- 主要内容区域 -->
    <main class="diary-main">
      <!-- 导航标签 -->
      <div class="diary-navigation">
        <div class="nav-tabs">
          <button 
            class="nav-tab" 
            :class="{ active: activeTab === 'edit' }"
            @click="activeTab = 'edit'"
          >
            <i class="fas fa-pen"></i>
            <span>写日记</span>
          </button>
          <button 
            class="nav-tab" 
            :class="{ active: activeTab === 'list' }"
            @click="switchToList"
          >
            <i class="fas fa-list"></i>
            <span>日记列表</span>
          </button>
        </div>
      </div>
      
      <!-- 编辑日记界面 -->
      <section v-if="activeTab === 'edit'" class="diary-edit-section">
        <div class="edit-header">
          <div class="date-selector-card">
            <label class="date-label">选择日期</label>
            <div class="date-input-group">
              <el-date-picker
                v-model="selectedDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                @change="onDateChange"
                class="date-picker"
              >
              </el-date-picker>
              <button class="today-btn" @click="resetDate">今天</button>
            </div>
          </div>
        </div>
        
        <div class="edit-content">
          <div class="input-card">
            <div class="input-header">
              <i class="fas fa-heading"></i>
              <span>日记标题</span>
            </div>
            <el-input
              v-model="currentDiary.title"
              placeholder="给今天的学习起个标题..."
              class="title-input"
              size="large"
            ></el-input>
          </div>
          
          <div class="input-card">
            <div class="input-header">
              <i class="fas fa-file-alt"></i>
              <span>日记内容</span>
            </div>
            <el-input
              v-model="currentDiary.content"
              type="textarea"
              :rows="12"
              placeholder="记录今天的学习心得、遇到的困难、解决的方法、收获的知识..."
              class="content-input"
              resize="none"
            ></el-input>
          </div>
          

        </div>
        
        <div class="edit-actions">
          <button class="action-btn clear-btn" @click="clearDiary">
            <i class="fas fa-trash"></i>
            <span>清空</span>
          </button>
          <button class="action-btn save-btn" @click="saveDiary">
            <i class="fas fa-save"></i>
            <span>保存日记</span>
          </button>
        </div>
      </section>
      
      <!-- 日记列表界面 -->
      <section v-else-if="activeTab === 'list'" class="diary-list-section">
        <div class="list-header">
          <div class="search-card">
            <div class="search-input-wrapper">
              <i class="fas fa-search"></i>
              <el-input
                v-model="searchQuery"
                placeholder="搜索日记标题、内容或日期..."
                class="search-input"
                size="large"
                clearable
              ></el-input>
            </div>
          </div>
        </div>
        
        <div class="list-content">
          <div v-if="filteredDiaries.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-book-open"></i>
            </div>
            <h3>暂无日记记录</h3>
            <p>开始记录你的学习之旅吧！</p>
            <button class="start-writing-btn" @click="activeTab = 'edit'">
              <i class="fas fa-pen"></i>
              <span>开始写日记</span>
            </button>
          </div>
          
          <div v-else class="diary-grid">
            <div
              v-for="diary in filteredDiaries"
              :key="diary.date"
              class="diary-card"
              @click="viewDiary(diary)"
            >
              <div class="diary-card-header">
                <div class="diary-date">
                  <i class="fas fa-calendar"></i>
                  <span>{{ formatDate(diary.date) }}</span>
                </div>
                <div class="diary-word-count">
                  {{ getDiaryWordCount(diary) }} 字
                </div>
              </div>
              <div class="diary-card-content">
                <h3 class="diary-title">{{ diary.title || getDefaultTitle(diary) }}</h3>
                <p class="diary-preview">{{ getPreview(diary.content) }}</p>
              </div>
              <div class="diary-card-footer">
                <div class="diary-mood">
                  {{ getDiaryMood(diary) }}
                </div>
                <div class="diary-action">
                  <i class="fas fa-arrow-right"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <!-- 日记详情对话框 -->
    <el-dialog
      v-model="showDiaryDetail"
      :title="selectedDiaryDetail?.title || '日记详情'"
      width="70%"
      class="diary-detail-dialog"
      destroy-on-close
    >
      <div class="diary-detail">
        <div class="diary-detail-header">
          <div class="diary-detail-date">
            <i class="fas fa-calendar"></i>
            <span>{{ formatDate(selectedDiaryDetail?.date) }}</span>
          </div>
          <div class="diary-detail-stats">
            <span class="word-count">{{ getDiaryWordCount(selectedDiaryDetail) }} 字</span>
          </div>
        </div>
        <div class="diary-detail-content">
          {{ selectedDiaryDetail?.content }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, watch, onUnmounted } from 'vue'
import { ElMessage, ElDialog } from 'element-plus'

export default {
  name: 'Diary',
  props: {
    words: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const selectedDate = ref(getTodayDateString())
    const currentDiary = ref({ title: '', content: '' })
    const activeTab = ref('edit') // 'edit' 或 'list'
    const diariesList = ref([]) // 所有日记的列表
    const searchQuery = ref('')
    const showDiaryDetail = ref(false)
    const selectedDiaryDetail = ref(null)
    
    // 获取今天的日期字符串 (YYYY-MM-DD 格式)
    function getTodayDateString() {
      const now = new Date()
      return now.toISOString().split('T')[0]
    }
    

    
    // 过滤日记列表
    const filteredDiaries = computed(() => {
      if (!diariesList.value || diariesList.value.length === 0) return []
      
      const query = searchQuery.value.toLowerCase().trim()
      if (!query) return diariesList.value
      
      return diariesList.value.filter(diary => 
        diary.title?.toLowerCase().includes(query) || 
        diary.content.toLowerCase().includes(query) ||
        diary.date.includes(query)
      )
    })
    
    // 加载指定日期的日记
    function loadDiary(date) {
      try {
        const diaries = JSON.parse(localStorage.getItem('dailyEnglishDiaries') || '{}')
        currentDiary.value = diaries[date] || { title: '', content: '' }
      } catch (error) {
        console.error('加载日记失败:', error)
        currentDiary.value = { title: '', content: '' }
      }
    }
    
    // 加载所有日记到列表
    function loadAllDiaries() {
      try {
        const diaries = JSON.parse(localStorage.getItem('dailyEnglishDiaries') || '{}')
        const diariesArray = []
        
        // 转换为数组格式并添加日期信息
        Object.keys(diaries).forEach(date => {
          if (diaries[date] && diaries[date].content) {
            diariesArray.push({
              date,
              title: diaries[date].title || '',
              content: diaries[date].content
            })
          }
        })
        
        // 按日期降序排序
        diariesList.value = diariesArray.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        )
      } catch (error) {
        console.error('加载日记列表失败:', error)
        diariesList.value = []
      }
    }
    
    // 保存日记
    function saveDiary() {
      try {
        const diaries = JSON.parse(localStorage.getItem('dailyEnglishDiaries') || '{}')
        diaries[selectedDate.value] = currentDiary.value
        localStorage.setItem('dailyEnglishDiaries', JSON.stringify(diaries))
        
        // 保存后刷新日记列表
        loadAllDiaries()
        
        // 清空输入框
        currentDiary.value = {
          title: '',
          content: ''
        }
        
        // 显示保存成功的提示
        ElMessage.success('日记保存成功')
      } catch (error) {
        console.error('保存日记失败:', error)
        ElMessage.error('保存日记失败，请重试')
      }
    }
    
    // 清空日记
    function clearDiary() {
      currentDiary.value = { title: '', content: '' }
      saveDiary()
    }
    
    // 重置日期为今天
    function resetDate() {
      selectedDate.value = getTodayDateString()
    }
    
    // 日期改变时加载对应的日记
    function onDateChange(newDate) {
      loadDiary(newDate)
    }
    
    // 切换标签页
    function onTabChange(tab) {
      if (tab.paneName === 'list') {
        loadAllDiaries()
      }
    }
    
    // 查看日记详情
    function viewDiary(diary) {
      selectedDiaryDetail.value = diary
      showDiaryDetail.value = true
    }
    
    // 获取默认标题
    function getDefaultTitle(diary) {
      if (!diary.content) return '无标题日记'
      
      // 从内容中提取第一行作为默认标题
      const firstLine = diary.content.split('\n')[0]
      return firstLine.length > 20 ? firstLine.substring(0, 20) + '...' : firstLine || '无标题日记'
    }
    
    // 获取内容预览
    function getPreview(content) {
      if (!content) return ''
      return content.length > 80 ? content.substring(0, 80) + '...' : content
    }
    
    // 格式化日期显示
    function formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
    }
    
    // 监听选中日期变化
    watch(selectedDate, (newDate) => {
      loadDiary(newDate)
    })
    
    // 组件挂载时加载今天的日记
    loadDiary(selectedDate.value)
    
    // 监听单词更新事件
    const handleWordUpdate = () => {
      // 当单词更新时，日记组件不需要重新加载数据，因为它依赖props.words
    }
    
    window.addEventListener('wordUpdated', handleWordUpdate)
    
    // 计算总日记数量
    const totalDiaries = computed(() => {
      return diariesList.value.length
    })
    
    // 计算连续记录天数
    const currentStreak = computed(() => {
      if (diariesList.value.length === 0) return 0
      
      const sortedDates = diariesList.value
        .map(diary => new Date(diary.date))
        .sort((a, b) => b - a)
      
      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      for (let i = 0; i < sortedDates.length; i++) {
        const expectedDate = new Date(today)
        expectedDate.setDate(today.getDate() - i)
        expectedDate.setHours(0, 0, 0, 0)
        
        if (sortedDates[i].getTime() === expectedDate.getTime()) {
          streak++
        } else {
          break
        }
      }
      
      return streak
    })
    
    // 获取日记字数
    function getDiaryWordCount(diary) {
      if (!diary || !diary.content) return 0
      return diary.content.replace(/\s/g, '').length
    }
    
    // 获取日记心情（基于内容的简单分析）
    function getDiaryMood(diary) {
      if (!diary || !diary.content) return '😊'
      
      const content = diary.content.toLowerCase()
      if (content.includes('困难') || content.includes('挑战') || content.includes('问题')) {
        return '💪'
      } else if (content.includes('开心') || content.includes('成功') || content.includes('进步')) {
        return '😊'
      } else if (content.includes('累') || content.includes('疲惫') || content.includes('压力')) {
        return '😔'
      } else {
        return '📝'
      }
    }
    
    // 切换到列表页面
    function switchToList() {
      activeTab.value = 'list'
      loadAllDiaries()
    }
    
    return {
      selectedDate,
      currentDiary,

      activeTab,
      diariesList,
      filteredDiaries,
      searchQuery,
      showDiaryDetail,
      selectedDiaryDetail,
      totalDiaries,
      currentStreak,
      saveDiary,
      clearDiary,
      resetDate,
      onDateChange,
      onTabChange,
      viewDiary,
      getDefaultTitle,
      getPreview,
      formatDate,
      getDiaryWordCount,
      getDiaryMood,
      switchToList
    }
  }
}
</script>

<style scoped>
.diary-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: transparent;
}

/* 背景装饰元素 */
.diary-container::before {
  content: '';
  position: fixed;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.08;
  z-index: -1;
  animation: float 8s ease-in-out infinite;
}

.diary-container::after {
  content: '';
  position: fixed;
  bottom: -30%;
  left: -10%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  opacity: 0.08;
  z-index: -1;
  animation: float 10s ease-in-out infinite reverse;
}

.bg-gradient {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.03;
  z-index: -2;
}

.bg-circle {
  position: fixed;
  border-radius: 50%;
  opacity: 0.06;
  z-index: -1;
}

.bg-circle:nth-child(1) {
  top: 15%;
  left: 8%;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: float 6s ease-in-out infinite;
}

.bg-circle:nth-child(2) {
  top: 70%;
  right: 8%;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  animation: float 7s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(180deg); }
}

/* 页面头部 */
.diary-header {
  margin-bottom: 40px;
  animation: fadeInDown 0.8s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 32px 40px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.header-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.header-title h1 {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-subtitle {
  font-size: 16px;
  color: #6c757d;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 24px;
}

.stat-card {
  text-align: center;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  min-width: 100px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 主要内容区域 */
.diary-main {
  animation: fadeInUp 0.8s ease-out 0.2s backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 导航标签 */
.diary-navigation {
  margin-bottom: 32px;
}

.nav-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  width: fit-content;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 500;
  color: #6c757d;
}

.nav-tab:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.nav-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.nav-tab i {
  font-size: 16px;
}

/* 编辑日记区域 */
.diary-edit-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.edit-header {
  margin-bottom: 8px;
}

.date-selector-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.date-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.date-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.date-picker {
  flex: 1;
}

.today-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.today-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* 输入卡片 */
.input-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.input-card:hover {
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.1);
}

.input-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.input-header i {
  color: #667eea;
}

.title-input :deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 2px solid #e1e5e9;
  box-shadow: none;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.title-input :deep(.el-input__wrapper):hover {
  border-color: #667eea;
}

.title-input :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.content-input :deep(.el-textarea__inner) {
  border-radius: 12px;
  border: 2px solid #e1e5e9;
  transition: all 0.3s ease;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.8);
}

.content-input :deep(.el-textarea__inner):hover {
  border-color: #667eea;
}

.content-input :deep(.el-textarea__inner):focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}



/* 操作按钮 */
.edit-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.clear-btn {
  background: rgba(245, 101, 101, 0.1);
  color: #f56565;
  border: 1px solid rgba(245, 101, 101, 0.2);
}

.clear-btn:hover {
  background: #f56565;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(245, 101, 101, 0.3);
}

.save-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 日记列表区域 */
.diary-list-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.list-header {
  margin-bottom: 8px;
}

.search-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 4px 16px;
  border: 2px solid #e1e5e9;
  transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input-wrapper i {
  color: #6c757d;
  font-size: 16px;
}

.search-input :deep(.el-input__wrapper) {
  border: none;
  box-shadow: none;
  background: transparent;
  padding: 8px 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.empty-icon {
  font-size: 64px;
  color: #667eea;
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 24px;
  color: #2c3e50;
  margin: 0 0 12px 0;
}

.empty-state p {
  font-size: 16px;
  color: #6c757d;
  margin: 0 0 32px 0;
}

.start-writing-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.start-writing-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* 日记网格 */
.diary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.diary-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.diary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.diary-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

.diary-card:hover::before {
  transform: scaleX(1);
}

.diary-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.diary-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6c757d;
}

.diary-date i {
  color: #667eea;
}

.diary-word-count {
  font-size: 12px;
  color: #909399;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
}

.diary-card-content {
  margin-bottom: 16px;
}

.diary-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.diary-preview {
  font-size: 14px;
  color: #6c757d;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.diary-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.diary-mood {
  font-size: 20px;
}

.diary-action {
  color: #667eea;
  font-size: 16px;
  transition: all 0.3s ease;
}

.diary-card:hover .diary-action {
  transform: translateX(4px);
}

/* 日记详情对话框 */
.diary-detail-dialog :deep(.el-dialog) {
  border-radius: 24px;
  overflow: hidden;
}

.diary-detail {
  padding: 20px 0;
}

.diary-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e1e5e9;
}

.diary-detail-date {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #6c757d;
}

.diary-detail-date i {
  color: #667eea;
}

.diary-detail-stats {
  display: flex;
  gap: 16px;
}

.word-count {
  font-size: 14px;
  color: #909399;
  background: rgba(102, 126, 234, 0.1);
  padding: 6px 12px;
  border-radius: 16px;
}

.diary-detail-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.8;
  font-size: 16px;
  color: #2c3e50;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .diary-container {
    padding: 32px 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
  
  .header-stats {
    justify-content: center;
  }
  
  .diary-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .diary-container {
    padding: 24px 12px;
  }
  
  .header-content {
    padding: 24px 20px;
  }
  
  .header-title h1 {
    font-size: 28px;
  }
  
  .header-subtitle {
    font-size: 14px;
  }
  
  .stat-card {
    padding: 16px 20px;
    min-width: 80px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .nav-tabs {
    width: 100%;
    justify-content: center;
  }
  
  .nav-tab {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .date-input-group {
    flex-direction: column;
  }
  
  .today-btn {
    width: 100%;
  }
  

  
  .edit-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
    justify-content: center;
  }
  
  .diary-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .diary-detail-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 10px;
  }
}

@media (max-width: 480px) {
  .diary-container {
    padding: 20px 8px;
  }
  
  .header-content {
    padding: 20px 16px;
  }
  
  .header-title h1 {
    font-size: 24px;
  }
  
  .header-stats {
    gap: 16px;
  }
  
  .stat-card {
    padding: 12px 16px;
    min-width: 70px;
  }
  
  .stat-number {
    font-size: 20px;
  }
  
  .nav-tab {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .input-card,
  .date-selector-card,
  .search-card {
    padding: 20px;
  }
  
  .diary-card {
    padding: 20px;
  }
  
  .diary-title {
    font-size: 16px;
  }
  
  .diary-preview {
    font-size: 13px;
  }
  
  .empty-state {
    padding: 60px 16px;
  }
  
  .empty-icon {
    font-size: 48px;
  }
  
  .empty-state h3 {
    font-size: 20px;
  }
  
  .empty-state p {
    font-size: 14px;
  }
}

@media (max-width: 375px) {
  .header-content {
    padding: 16px 12px;
  }
  
  .header-title h1 {
    font-size: 22px;
  }
  
  .stat-card {
    padding: 10px 12px;
    min-width: 60px;
  }
  
  .stat-number {
    font-size: 18px;
  }
  
  .stat-label {
    font-size: 11px;
  }
  
  .input-card,
  .date-selector-card,
  .search-card {
    padding: 16px;
  }
  
  .diary-card {
    padding: 16px;
  }
  
  .diary-detail-content {
    padding: 20px;
    font-size: 15px;
  }
}
</style>