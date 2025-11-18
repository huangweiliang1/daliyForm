<template>
  <div class="stats-view-container">
    <!-- 背景装饰元素 -->
    <div class="background-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-gradient"></div>
    </div>
    
    <!-- 页面头部 -->
    <header class="stats-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-icon">
            <TrendCharts />
          </div>
          <div class="header-text">
            <h1 class="header-title">学习统计</h1>
            <p class="header-subtitle">追踪你的学习进度和成就</p>
          </div>
        </div>
        <div class="header-actions">
          <div class="update-time">
            <i class="fas fa-clock"></i>
            <span>{{ formatUpdateTime(lastUpdateTime) }}</span>
          </div>
          <div class="real-time-indicator">
            <div class="indicator-dot" :class="{ 'active': !refreshAnimation }"></div>
            <span class="indicator-text">实时更新</span>
          </div>
          <button 
            class="refresh-btn" 
            @click="refreshData"
            :class="{ 'refreshing': refreshAnimation }"
          >
            <i class="fas fa-sync-alt" :class="{ 'fa-spin': refreshAnimation }"></i>
            <span>刷新数据</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="stats-main">
      <!-- 核心统计指标 -->
      <section class="core-metrics">
        <div class="metrics-grid">
          <div class="metric-card total-words" :class="{ 'metric-animate': isAnimated }">
            <div class="metric-content">
              <div class="metric-icon">
                <Document />
              </div>
              <div class="metric-info">
                <div class="metric-number">{{ totalWords }}</div>
                <div class="metric-label">总单词数</div>
              </div>
              <div class="metric-trend positive">
                <i class="fas fa-arrow-up"></i>
                <span>+12%</span>
              </div>
            </div>
          </div>
          
          <div class="metric-card study-days" :class="{ 'metric-animate': isAnimated }">
            <div class="metric-content">
              <div class="metric-icon">
                <Calendar />
              </div>
              <div class="metric-info">
                <div class="metric-number">{{ studyDays }}</div>
                <div class="metric-label">学习天数</div>
              </div>
              <div class="metric-trend positive">
                <i class="fas fa-arrow-up"></i>
                <span>+7天</span>
              </div>
            </div>
          </div>
          
          <div class="metric-card today-words" :class="{ 'metric-animate': isAnimated }">
            <div class="metric-content">
              <div class="metric-icon">
                <i class="fas fa-sun"></i>
              </div>
              <div class="metric-info">
                <div class="metric-number">{{ todayWords }}</div>
                <div class="metric-label">今日单词</div>
              </div>
              <div class="metric-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: Math.min((todayWords / dailyTarget) * 100, 100) + '%' }"></div>
                </div>
                <span class="progress-text">{{ dailyTarget }} 目标</span>
              </div>
            </div>
          </div>
          
          <div class="metric-card mastered-words" :class="{ 'metric-animate': isAnimated }">
            <div class="metric-content">
              <div class="metric-icon">
                <i class="fas fa-star"></i>
              </div>
              <div class="metric-info">
                <div class="metric-number">{{ masteredWords }}</div>
                <div class="metric-label">已掌握</div>
              </div>
              <div class="metric-trend positive">
                <i class="fas fa-arrow-up"></i>
                <span>+5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 详细分析区域 -->
      <section class="detailed-analysis">
        <div class="analysis-grid">
          <!-- 学习趋势图表 -->
          <div class="analysis-card trend-analysis" :class="{ 'analysis-animate': isAnimated }">
            <div class="card-header">
              <div class="card-title">
                <i class="fas fa-chart-bar"></i>
                <span>学习趋势</span>
              </div>
              <div class="card-period">
                <select v-model="trendPeriod" class="period-selector">
                  <option value="7">最近7天</option>
                  <option value="14">最近14天</option>
                  <option value="30">最近30天</option>
                </select>
              </div>
            </div>
            <div class="card-content">
              <div class="trend-chart">
                <div class="chart-container">
                  <div class="trend-bars">
                    <div v-for="day in filteredTrendData" :key="day.date" class="trend-bar-container">
                      <div class="trend-bar" :style="{ height: day.height + '%' }">
                        <span class="trend-count">{{ day.count }}</span>
                      </div>
                      <div class="trend-label">{{ day.label }}</div>
                      <div class="trend-date">{{ day.shortDate }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 标签分布 -->
          <div class="analysis-card tag-distribution" :class="{ 'analysis-animate': isAnimated }">
            <div class="card-header">
              <div class="card-title">
                <i class="fas fa-tags"></i>
                <span>标签分布</span>
              </div>
            </div>
            <div class="card-content">
              <div v-if="tagStats.length > 0" class="tag-list">
                <div v-for="tag in tagStats" :key="tag.name" class="tag-item">
                  <div class="tag-info">
                    <span class="tag-name">{{ tag.name }}</span>
                    <span class="tag-count">{{ tag.count }}个</span>
                  </div>
                  <div class="tag-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: tag.percentage + '%', backgroundColor: tag.color }"></div>
                    </div>
                    <span class="tag-percentage">{{ tag.percentage }}%</span>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <div class="empty-icon">
                  <i class="fas fa-tags"></i>
                </div>
                <p>暂无标签数据</p>
                <small>开始为单词添加标签来查看分布</small>
              </div>
            </div>
          </div>

          <!-- 学习效率 -->
          <div class="analysis-card efficiency-analysis" :class="{ 'analysis-animate': isAnimated }">
            <div class="card-header">
              <div class="card-title">
                <i class="fas fa-trophy"></i>
                <span>学习效率</span>
              </div>
            </div>
            <div class="card-content">
              <div class="efficiency-display">
                <div class="efficiency-circle" :class="{ 'efficient': efficiencyScore > 70 }">
                  <div class="efficiency-score">{{ efficiencyScore }}</div>
                </div>
                <div class="efficiency-details">
                  <div class="efficiency-label">今日效率评分</div>
                  <div class="efficiency-description">
                    {{ getEfficiencyDescription(efficiencyScore) }}
                  </div>
                  <div class="efficiency-tips">
                    <div class="tip-item">
                      <i class="fas fa-check-circle"></i>
                      <span>掌握率: {{ Math.round((masteredWords / Math.max(totalWords, 1)) * 100) }}%</span>
                    </div>
                    <div class="tip-item">
                      <i class="fas fa-clock"></i>
                      <span>复习频率: 良好</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 学习目标 -->
          <div class="analysis-card goal-tracking" :class="{ 'analysis-animate': isAnimated }">
            <div class="card-header">
              <div class="card-title">
                <i class="fas fa-sun"></i>
                <span>学习目标</span>
              </div>
              <button class="edit-goal-btn" @click="openTargetDialog">
                <i class="fas fa-edit"></i>
              </button>
            </div>
            <div class="card-content">
              <div class="goal-display">
                <div class="goal-current">
                  <div class="goal-number">{{ dailyTarget }}</div>
                  <div class="goal-label">每日目标</div>
                </div>
                <div class="goal-progress">
                  <div class="progress-ring">
                    <svg width="80" height="80">
                      <circle cx="40" cy="40" r="35" stroke="#e1e5e9" stroke-width="6" fill="none"/>
                      <circle 
                        cx="40" cy="40" r="35" 
                        :stroke-dasharray="219.91" 
                        :stroke-dashoffset="219.91 - (219.91 * Math.min(todayWords / dailyTarget, 1))"
                        stroke="url(#gradient)" 
                        stroke-width="6" 
                        fill="none"
                        stroke-linecap="round"
                        transform="rotate(-90 40 40)"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div class="progress-text">
                      <span class="progress-percentage">{{ Math.round((todayWords / dailyTarget) * 100) }}%</span>
                    </div>
                  </div>
                  <div class="goal-status">
                    {{ getGoalStatus(todayWords, dailyTarget) }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    
    <!-- 每日目标设置对话框 -->
    <el-dialog
      v-model="showTargetDialog"
      title="设置每日目标"
      width="400px"
      class="goal-dialog"
    >
      <div class="target-setting">
        <p class="setting-description">请设置您的每日单词学习目标：</p>
        <div class="target-input-group">
          <el-input-number
            v-model="tempTarget"
            :min="1"
            :max="100"
            size="large"
            class="target-input"
          ></el-input-number>
          <span class="target-unit">个单词</span>
        </div>
        <div class="target-suggestions">
          <div class="suggestion-title">快速选择：</div>
          <div class="suggestion-buttons">
            <button 
              v-for="suggestion in [10, 20, 30, 50]" 
              :key="suggestion"
              class="suggestion-btn"
              @click="setQuickTarget(suggestion)"
            >
              {{ suggestion }}
            </button>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showTargetDialog = false" size="large">取消</el-button>
          <el-button type="primary" @click="saveDailyTarget" size="large">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue'
import { ElDialog, ElInputNumber, ElButton, ElMessage } from 'element-plus'
import { useWordStore } from '../stores/wordStore'

const props = defineProps({
  words: {
    type: Array,
    default: () => []
  },
  dailyTarget: {
    type: Number,
    default: 20
  }
})

const emit = defineEmits(['update:dailyTarget', 'refresh'])

const store = useWordStore()
    const isAnimated = ref(false)
    const showTargetDialog = ref(false)
    const trendPeriod = ref(7)
    const refreshAnimation = ref(false)
    const lastUpdateTime = ref(new Date())
    
    // 每日目标
    const dailyTarget = ref(props.dailyTarget || 20)
    const tempTarget = ref(dailyTarget.value)
    
    // 监听器清理函数
    let unwatchLastUpdated = null
    

    
    // 获取今天的日期字符串 (YYYY-MM-DD 格式)
    const getTodayDateString = () => {
      const now = new Date();
      return now.toISOString().split('T')[0];
    }
    
    // 打开目标设置对话框
    const openTargetDialog = () => {
      tempTarget.value = dailyTarget.value
      showTargetDialog.value = true
    }
    
    // 保存每日目标
    const saveDailyTarget = () => {
      if (tempTarget.value > 0) {
        localStorage.setItem('dailyEnglishTarget', tempTarget.value.toString())
        emit('update:dailyTarget', tempTarget.value)
        showTargetDialog.value = false
        ElMessage.success('每日学习目标已更新')
      }
    }
    
    // 快速设置目标
    const setQuickTarget = (target) => {
      tempTarget.value = target
    }
    
    // 手动刷新数据方法
const refreshData = async () => {
  refreshAnimation.value = true
  try {
    await store.loadFromDB()
    lastUpdateTime.value = new Date()
    ElMessage.success({
      message: '数据已手动刷新',
      duration: 2000,
      showClose: true
    })
    
    // 添加刷新动画
    addDataUpdateAnimation()
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error({
      message: '刷新数据失败',
      duration: 3000,
      showClose: true
    })
  } finally {
    setTimeout(() => {
      refreshAnimation.value = false
    }, 1000)
  }
}

// 格式化更新时间
const formatUpdateTime = (date) => {
  const now = new Date()
  const diff = now - date
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (seconds < 60) return '刚刚更新'
  if (minutes < 60) return `${minutes}分钟前更新`
  if (hours < 24) return `${hours}小时前更新`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
    
    // 获取效率描述
    const getEfficiencyDescription = (score) => {
      if (score >= 90) return '学习状态极佳，保持！'
      if (score >= 70) return '学习效率良好，继续努力'
      if (score >= 50) return '学习状态一般，需要加强'
      return '学习效率较低，建议调整方法'
    }
    
    // 获取目标状态
    const getGoalStatus = (current, target) => {
      const percentage = (current / target) * 100
      if (percentage >= 100) return '🎉 目标达成！'
      if (percentage >= 80) return '💪 即将完成'
      if (percentage >= 50) return '📈 进展顺利'
      if (percentage >= 20) return '🚀 开始加速'
      return '🌱 刚刚开始'
    }
    
    // 计算统计数据 - 基于store的实时数据
    const stats = computed(() => {
      const today = getTodayDateString();
      
      // 使用store中的数据
      const allWords = store.words;
      const todayWords = allWords.filter(w => w.date === today);
      
      // 计算学习天数 - 统计所有有单词记录的不重复日期数量
      const studyDateSet = new Set();
      allWords.forEach(word => {
        if (word.date) {
          studyDateSet.add(word.date);
        }
      });
      const studyDaysCount = studyDateSet.size;
      
      // 计算所有已掌握的单词
      const masteredCount = allWords.filter(w => w.mastered).length;
      
      return {
        totalWords: allWords.length,
        todayWords: todayWords.length,
        studyDays: studyDaysCount,
        dailyTarget: dailyTarget.value,
        mastered: masteredCount
      }
    })
    
    // 生成过去N天的日期和标签
    const generateLastDays = (days) => {
      const result = [];
      const today = new Date();
      const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = weekDays[date.getDay()];
        
        result.push({
          date: dateStr,
          count: 0,
          height: 0,
          label: dayOfWeek,
          shortDate: `${date.getMonth() + 1}/${date.getDate()}`
        });
      }
      return result;
    }
    
    // 计算学习趋势数据 - 基于store中的实时单词数据
    const trendData = computed(() => {
      const days = generateLastDays(14);
      const allWords = store.words;
      
      // 统计每天的单词数
      const dailyCounts = {};
      allWords.forEach(word => {
        if (word.date) {
          dailyCounts[word.date] = (dailyCounts[word.date] || 0) + 1;
        }
      });
      
      // 更新高度
      const maxCount = Math.max(...Object.values(dailyCounts), 1);
      days.forEach(day => {
        day.count = dailyCounts[day.date] || 0;
        day.height = day.count > 0 ? (day.count / maxCount) * 100 : 0;
      });
      
      return days;
    })
    
    // 根据选择的周期过滤趋势数据
    const filteredTrendData = computed(() => {
      return trendData.value.slice(-trendPeriod.value)
    })
    
    // 标签统计 - 基于store中的实时单词数据
    const tagStats = computed(() => {
      const tags = {};
      const allWords = store.words;
      
      // 统计所有单词的标签
      allWords.forEach(word => {
        if (word.tags && word.tags.length > 0) {
          word.tags.forEach(tag => {
            tags[tag] = (tags[tag] || 0) + 1;
          });
        }
      });
      
      const total = Object.values(tags).reduce((sum, count) => sum + count, 0);
      if (total === 0) {
        return [];
      }
      
      return Object.keys(tags).map(name => ({
        name,
        count: tags[name],
        percentage: Math.round((tags[name] / total) * 100),
        color: getRandomColor()
      }));
    })
    
    // 效率评分 - 基于store中的实时单词数据
    const efficiencyScore = computed(() => {
      const today = getTodayDateString();
      const allWords = store.words;
      const todayWords = allWords.filter(w => w.date === today);
      
      if (todayWords.length === 0) {
        return 0;
      }
      
      const masteredRate = todayWords.filter(w => w.mastered).length / todayWords.length;
      const avgReviewCount = todayWords.reduce((sum, w) => sum + (w.reviewCount || 0), 0) / todayWords.length;
      
      return Math.round(masteredRate * 60 + (2 - Math.min(avgReviewCount / 5, 1)) * 40);
    })
    
    // 核心统计数据的计算属性
    const totalWords = computed(() => store.words.length)
    
    const todayWords = computed(() => {
      const today = getTodayDateString()
      return store.words.filter(w => w.date === today).length
    })
    
    const studyDays = computed(() => {
      const studyDateSet = new Set()
      store.words.forEach(word => {
        if (word.date) {
          studyDateSet.add(word.date)
        }
      })
      return studyDateSet.size
    })
    
    const masteredWords = computed(() => {
      return store.words.filter(w => w.mastered).length
    })
    
    // 生成随机颜色
    function getRandomColor() {
      const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
      return colors[Math.floor(Math.random() * colors.length)]
    }
    
    // 监听store数据变化 - 实现真正的实时自动刷新
watch(
  () => store.words,
  (newWords, oldWords) => {
    // 当单词数据变化时，立即更新统计信息
    console.log('单词数据已更新，统计信息自动刷新')
    lastUpdateTime.value = new Date()
    
    // 添加数据更新动画效果
    addDataUpdateAnimation()
    
    // 显示更新提示
    ElMessage.success({
      message: '统计数据已更新',
      duration: 2000,
      showClose: true
    })
  },
  { deep: true }
)

watch(
  () => store.diaries,
  () => {
    console.log('日记数据已更新')
    lastUpdateTime.value = new Date()
  },
  { deep: true }
)

// 数据更新动画效果
const addDataUpdateAnimation = () => {
  // 添加数据更新动画
  const cards = document.querySelectorAll('.metric-card, .analysis-card')
  cards.forEach((card, index) => {
    card.style.transform = 'scale(0.95)'
    card.style.transition = 'transform 0.3s ease'
    setTimeout(() => {
      card.style.transform = 'scale(1)'
    }, 100 + index * 50)
  })
  
  // 重新触发动画效果
  isAnimated.value = false
  setTimeout(() => {
    isAnimated.value = true
  }, 100)
}

// 生命周期钩子
onMounted(async () => {
  // 确保store已初始化
  if (!store.initialized) {
    await store.initialize()
  }
  
  // 加载保存的目标设置
  const savedTarget = localStorage.getItem('dailyEnglishTarget')
  if (savedTarget) {
    dailyTarget.value = parseInt(savedTarget)
  }
  
  // 添加动画效果
  setTimeout(() => {
    const cards = document.querySelectorAll('.metric-card, .analysis-card')
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('metric-animate', 'analysis-animate')
      }, index * 100)
    })
  }, 100)
  
  // 监听store的lastUpdated变化，实现额外的实时更新保障
  unwatchLastUpdated = watch(
    () => store.lastUpdated,
    () => {
      console.log('检测到数据更新，统计信息已同步')
      lastUpdateTime.value = new Date()
    }
  )
  
  // 监听自定义事件，确保跨组件通信
  window.addEventListener('wordUpdated', handleWordUpdated)
})

// 处理单词更新事件
const handleWordUpdated = () => {
  console.log('接收到单词更新事件')
  lastUpdateTime.value = new Date()
  addDataUpdateAnimation()
}

// 组件卸载时清理监听器
onUnmounted(() => {
  if (unwatchLastUpdated) {
    unwatchLastUpdated()
  }
  window.removeEventListener('wordUpdated', handleWordUpdated)
})
</script>

<style scoped>
.stats-view-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: transparent;
}

/* 背景装饰元素 */
.background-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.background-decoration::before {
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

.background-decoration::after {
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

.bg-circle-1 {
  top: 15%;
  left: 8%;
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: float 6s ease-in-out infinite;
}

.bg-circle-2 {
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
.stats-header {
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

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.header-text {
  flex: 1;
}

.header-title {
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

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  color: #667eea;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.refresh-btn.refreshing {
  background: #667eea;
  color: white;
  animation: pulse 1s ease-in-out;
}

.refresh-btn .fa-spin {
  animation: fa-spin 1s linear infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 主要内容区域 */
.stats-main {
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

/* 核心统计指标 */
.core-metrics {
  margin-bottom: 40px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
}

.metric-card::before {
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

.metric-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

.metric-card:hover::before {
  transform: scaleX(1);
}

.metric-card.metric-animate {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.5s ease;
}

.metric-card.total-words { transition-delay: 0.1s; }
.metric-card.study-days { transition-delay: 0.2s; }
.metric-card.today-words { transition-delay: 0.3s; }
.metric-card.mastered-words { transition-delay: 0.4s; }

.metric-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.metric-info {
  flex: 1;
}

.metric-number {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
  line-height: 1;
}

.metric-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #10b981;
  font-weight: 600;
}

.metric-trend.positive {
  color: #10b981;
}

.metric-trend.negative {
  color: #ef4444;
}

.metric-progress {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.progress-bar {
  width: 60px;
  height: 4px;
  background: #e1e5e9;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 10px;
  color: #6c757d;
}

/* 详细分析区域 */
.detailed-analysis {
  margin-bottom: 40px;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.analysis-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
}

.analysis-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.12);
}

.analysis-card.analysis-animate {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.5s ease;
}

.analysis-card.trend-analysis { transition-delay: 0.5s; }
.analysis-card.tag-distribution { transition-delay: 0.6s; }
.analysis-card.efficiency-analysis { transition-delay: 0.7s; }
.analysis-card.goal-tracking { transition-delay: 0.8s; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e1e5e9;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.card-title i {
  color: #667eea;
  font-size: 18px;
}

.period-selector {
  padding: 6px 12px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  color: #2c3e50;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-selector:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.edit-goal-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  color: #667eea;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.edit-goal-btn:hover {
  background: #667eea;
  color: white;
}

/* 趋势图表 */
.chart-container {
  width: 100%;
  overflow-x: auto;
}

.trend-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200px;
  padding: 20px 0;
  min-width: 100%;
}

.trend-bar-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 2px;
  min-width: 30px;
}

.trend-bar {
  width: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: center;
  min-height: 10px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.trend-bar:hover {
  background: linear-gradient(180deg, #764ba2 0%, #667eea 100%);
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

.trend-count {
  position: absolute;
  top: -25px;
  color: #667eea;
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
}

.trend-label {
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.trend-date {
  margin-top: 2px;
  font-size: 10px;
  color: #909399;
  text-align: center;
}

/* 标签分布 */
.tag-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.update-time {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(107, 114, 128, 0.1);
  border: 1px solid rgba(107, 114, 128, 0.2);
  border-radius: 6px;
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

.update-time i {
  font-size: 10px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.real-time-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 8px;
  font-size: 12px;
  color: #10b981;
  font-weight: 500;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  opacity: 0.5;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  opacity: 1;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.2);
    opacity: 0.7;
  }
}

.indicator-text {
  font-size: 12px;
  font-weight: 500;
}

.tag-info {
  display: flex;
  flex-direction: column;
  min-width: 80px;
}

.tag-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.tag-count {
  font-size: 12px;
  color: #6c757d;
}

.tag-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag-progress .progress-bar {
  flex: 1;
  height: 6px;
  background: #e1e5e9;
  border-radius: 3px;
  overflow: hidden;
}

.tag-progress .progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.tag-percentage {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  min-width: 35px;
  text-align: right;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6c757d;
}

.empty-icon {
  font-size: 48px;
  color: #667eea;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 8px 0;
}

.empty-state small {
  font-size: 14px;
  color: #909399;
}

/* 学习效率 */
.efficiency-display {
  display: flex;
  align-items: center;
  gap: 24px;
}

.efficiency-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(#667eea 0deg, #667eea calc(var(--efficiency-score, 70) * 3.6deg), #f0f2f5 calc(var(--efficiency-score, 70) * 3.6deg), #f0f2f5 360deg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  transition: transform 0.3s ease;
}

.efficiency-circle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

.efficiency-circle::before {
  content: '';
  position: absolute;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: white;
}

.efficiency-score {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
  z-index: 1;
}

.efficiency-details {
  flex: 1;
}

.efficiency-label {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.efficiency-description {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 12px;
}

.efficiency-tips {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6c757d;
}

.tip-item i {
  color: #10b981;
  font-size: 12px;
}

/* 学习目标 */
.goal-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.goal-current {
  text-align: center;
}

.goal-number {
  font-size: 36px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 8px;
}

.goal-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.goal-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.progress-ring {
  position: relative;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-percentage {
  font-size: 16px;
  font-weight: 700;
  color: #667eea;
}

.goal-status {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
}

/* 对话框样式 */
.goal-dialog :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
}

.target-setting {
  text-align: center;
}

.setting-description {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 24px;
}

.target-input-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.target-input {
  width: 120px;
}

.target-unit {
  font-size: 16px;
  color: #6c757d;
  font-weight: 500;
}

.target-suggestions {
  text-align: left;
}

.suggestion-title {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 12px;
}

.suggestion-buttons {
  display: flex;
  gap: 8px;
}

.suggestion-btn {
  padding: 8px 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  color: #2c3e50;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.suggestion-btn:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .stats-view-container {
    padding: 32px 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 24px;
    text-align: center;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .efficiency-display {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .goal-display {
    flex-direction: column;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .stats-view-container {
    padding: 24px 12px;
  }
  
  .header-content {
    padding: 24px 20px;
  }
  
  .header-title {
    font-size: 28px;
  }
  
  .header-subtitle {
    font-size: 14px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .metric-number {
    font-size: 24px;
  }
  
  .trend-bars {
    height: 150px;
    padding: 15px 0;
  }
  
  .trend-bar-container {
    margin: 0 1px;
    min-width: 25px;
  }
  
  .trend-count {
    font-size: 11px;
    top: -20px;
  }
  
  .trend-label {
    font-size: 11px;
  }
  
  .trend-date {
    font-size: 9px;
  }
}

@media (max-width: 480px) {
  .stats-view-container {
    padding: 20px 8px;
  }
  
  .header-content {
    padding: 20px 16px;
  }
  
  .header-title {
    font-size: 24px;
  }
  
  .header-subtitle {
    font-size: 13px;
  }
  
  .metric-card {
    padding: 20px;
  }
  
  .metric-number {
    font-size: 20px;
  }
  
  .analysis-card {
    padding: 20px;
  }
  
  .trend-bars {
    height: 120px;
    padding: 10px 0;
  }
  
  .trend-bar-container {
    min-width: 20px;
  }
  
  .efficiency-circle {
    width: 60px;
    height: 60px;
  }
  
  .efficiency-circle::before {
    width: 52px;
    height: 52px;
  }
  
  .efficiency-score {
    font-size: 14px;
  }
  
  .goal-number {
    font-size: 28px;
  }
}

@media (max-width: 375px) {
  .header-content {
    padding: 16px 12px;
  }
  
  .header-title {
    font-size: 22px;
  }
  
  .metric-card,
  .analysis-card {
    padding: 16px;
  }
  
  .metric-number {
    font-size: 18px;
  }
  
  .efficiency-circle {
    width: 50px;
    height: 50px;
  }
  
  .efficiency-circle::before {
    width: 44px;
    height: 44px;
  }
  
  .efficiency-score {
    font-size: 12px;
  }
  
  .goal-number {
    font-size: 24px;
  }
}
</style>