<template>
  <div class="view-words-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">单词记录</h1>
        <p class="page-subtitle">管理和查看学习进度</p>
      </div>
    </div>

    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="date-section">
        <div class="section-title">日期筛选</div>
        <div class="date-controls">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="loadWordsForDate"
            clearable
            size="small"
            class="custom-date-picker"
          />
          <el-button 
            v-if="selectedDate"
            @click="clearDateFilter"
            size="small"
            class="clear-btn"
            icon="RefreshLeft"
          >
            清除
          </el-button>
        </div>
      </div>
      
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-number">{{ filteredWords.length }}</div>
          <div class="stat-label">显示</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ allWords.length }}</div>
          <div class="stat-label">总计</div>
        </div>
      </div>
    </div>

    <!-- 单词列表 -->
    <div class="words-list">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-text">加载中...</div>
        <div class="loading-subtitle">请稍候</div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="filteredWords.length === 0" class="empty-state">
        <div class="empty-content">
          <h3 class="empty-title">
            {{ selectedDate ? `${selectedDate} 暂无单词` : '暂无单词记录' }}
          </h3>
          <p class="empty-description">
            {{ selectedDate ? '选择其他日期或添加新单词' : '开始添加你的第一个单词' }}
          </p>
          <el-button 
            type="primary" 
            @click="$emit('switch-to-add')"
            size="default"
            class="add-word-btn"
            icon="Plus"
          >
            添加单词
          </el-button>
        </div>
      </div>

      <!-- 单词列表 -->
      <div v-else class="words-grid">
        <div 
          v-for="(word, index) in filteredWords" 
          :key="word.id" 
          class="word-card mobile-optimized"
          :style="{ animationDelay: `${index * 0.05}s` }"
        >
          <div class="word-card-header">
            <div class="word-main">
              <div class="word-title">
                <span class="word-text">{{ word.word }}</span>
                <div class="word-badge">新</div>
              </div>
              <div v-if="word.pronunciation" class="word-pronunciation">
                {{ word.pronunciation }}
              </div>
            </div>
            <div class="word-actions">
              <el-button 
                size="small" 
                @click="editWord(word)"
                type="primary"
                :icon="Edit"
                circle
                class="action-btn edit-btn"
                title="编辑单词"
              />
              <el-button 
                size="small" 
                @click="confirmDelete(word)"
                type="danger"
                :icon="Delete"
                circle
                class="action-btn delete-btn"
                title="删除单词"
              />
            </div>
          </div>
          
          <div class="word-card-body">
            <div class="word-meaning-section">
              <div class="section-label">释义</div>
              <div class="word-meaning">{{ word.meaning }}</div>
            </div>
            
            <div v-if="word.example" class="word-example-section">
              <div class="section-label">例句</div>
              <div class="word-example">{{ word.example }}</div>
            </div>
          </div>
          
          <div class="word-card-footer">
            <div class="word-date-info">
              {{ formatDate(word.date || word.createdAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <el-dialog
      v-model="deleteDialogVisible"
      title="删除单词"
      width="400px"
      class="delete-dialog"
    >
      <div class="delete-dialog-content">
        <h3 class="delete-title">确认删除</h3>
        <p class="delete-message">
          确定要删除单词 "<strong>{{ wordToDelete?.word }}</strong>" 吗？
        </p>
        <p class="delete-warning-text">此操作不可恢复</p>
      </div>
      <template #footer>
        <div class="delete-dialog-footer">
          <el-button @click="deleteDialogVisible = false" class="cancel-btn">
            取消
          </el-button>
          <el-button 
            type="danger" 
            @click="deleteWord" 
            class="confirm-delete-btn"
            :loading="deleting"
          >
            删除
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useWordStore } from '../stores/wordStore'
import { Loading, Edit, Delete, RefreshLeft, Plus } from '@element-plus/icons-vue'

export default {
  name: 'ViewWords',
  components: {
    Loading,
    Edit,
    Delete,
    RefreshLeft,
    Plus
  },
  emits: ['edit-word', 'data-updated', 'switch-to-add'],
  setup(props, { emit }) {
    const wordStore = useWordStore()
    
    // 响应式数据
    const loading = ref(false)
    const selectedDate = ref('')
    const deleteDialogVisible = ref(false)
    const currentWordToDelete = ref(null)
    const deleting = ref(false)
    
    // 获取所有单词
    const allWords = computed(() => {
      return wordStore.words || []
    })
    
    // 根据选择的日期筛选单词
    const filteredWords = computed(() => {
      let words = [...allWords.value]
      
      // 如果选择了日期，只显示该日期的单词
      if (selectedDate.value) {
        words = words.filter(word => {
          const wordDate = formatDateForComparison(word.date || word.createdAt)
          return wordDate === selectedDate.value
        })
      }
      
      // 按日期倒序排列（最新的在前）
      words.sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt)
        const dateB = new Date(b.date || b.createdAt)
        return dateB - dateA
      })
      
      return words
    })
    
    // 格式化日期用于比较
    const formatDateForComparison = (dateStr) => {
      if (!dateStr) return ''
      
      try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) {
          return dateStr
        }
        
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      } catch (error) {
        return dateStr
      }
    }
    
    // 格式化日期用于显示
    const formatDate = (dateStr) => {
      if (!dateStr) return '未知日期'
      
      try {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) {
          return dateStr
        }
        
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}年${month}月${day}日`
      } catch (error) {
        return dateStr
      }
    }
    
    // 加载单词数据
    const loadWords = async () => {
      loading.value = true
      try {
        if (!wordStore.initialized) {
          await wordStore.initialize()
        }
        await wordStore.loadFromDB()
      } catch (error) {
        console.error('加载单词失败:', error)
      } finally {
        loading.value = false
      }
    }
    
    // 根据选择的日期加载单词
    const loadWordsForDate = async () => {
      console.log('选择日期:', selectedDate.value)
      // filteredWords会自动更新，不需要额外操作
    }
    
    // 清除日期筛选
    const clearDateFilter = () => {
      selectedDate.value = ''
    }
    
    // 编辑单词
    const editWord = (word) => {
      emit('edit-word', word)
    }
    
    // 确认删除
    const confirmDelete = (word) => {
      currentWordToDelete.value = word
      deleteDialogVisible.value = true
    }
    
    // 取消删除
    const cancelDelete = () => {
      deleteDialogVisible.value = false
      currentWordToDelete.value = null
    }
    
    // 删除单词
    const deleteWord = async () => {
      if (!currentWordToDelete.value) return
      
      deleting.value = true
      try {
        await wordStore.deleteWord(currentWordToDelete.value.id)
        emit('data-updated')
        deleteDialogVisible.value = false
        currentWordToDelete.value = null
      } catch (error) {
        console.error('删除单词失败:', error)
      } finally {
        deleting.value = false
      }
    }
    
    // 组件挂载时加载数据
    onMounted(async () => {
      await loadWords()
    })
    
    return {
      loading,
      selectedDate,
      deleteDialogVisible,
      currentWordToDelete,
      deleting,
      allWords,
      filteredWords,
      formatDate,
      loadWordsForDate,
      clearDateFilter,
      editWord,
      confirmDelete,
      cancelDelete,
      deleteWord
    }
  }
}
</script>

<style scoped>
.view-words-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
  min-height: 100vh;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 页面标题 */
.page-header {
  text-align: center;
  padding: 48px 0 32px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 32px;
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.page-title {
  font-size: 2em;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  letter-spacing: -0.025em;
}

.page-subtitle {
  font-size: 1em;
  color: #64748b;
  font-weight: 400;
  line-height: 1.5;
}

/* 顶部操作栏 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  gap: 24px;
  flex-wrap: wrap;
}

.date-section {
  flex: 1;
  min-width: 320px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 0.875em;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.date-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.custom-date-picker {
  flex: 1;
  min-width: 200px;
}

.clear-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.stats-section {
  display: flex;
  gap: 16px;
  min-width: 240px;
}

.stat-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 20px 16px;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.stat-number {
  font-size: 2em;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.75em;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* 单词列表 */
.words-list {
  margin-top: 24px;
}

.words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.word-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  position: relative;
}

.word-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.word-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
}

.word-main {
  flex: 1;
  min-width: 0;
}

.word-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.word-text {
  font-size: 1.5em;
  font-weight: 600;
  color: #1e293b;
}

.word-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.625em;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.word-pronunciation {
  color: #64748b;
  font-size: 0.875em;
  font-style: italic;
}

.word-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: white;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  color: #3b82f6;
}

.edit-btn:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.delete-btn {
  color: #ef4444;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.word-card-body {
  margin-bottom: 16px;
}

.word-meaning-section,
.word-example-section {
  margin-bottom: 16px;
}

.section-label {
  font-size: 0.75em;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.word-meaning {
  font-size: 1em;
  color: #374151;
  line-height: 1.5;
  font-weight: 400;
}

.word-example {
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
  font-style: italic;
  color: #475569;
  line-height: 1.5;
  font-size: 0.875em;
}

.word-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.word-date-info {
  color: #64748b;
  font-size: 0.75em;
  font-weight: 500;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-title {
  font-size: 1.5em;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.empty-description {
  font-size: 1em;
  color: #64748b;
  margin-bottom: 24px;
  line-height: 1.5;
}

.add-word-btn {
  background: #3b82f6;
  border: none;
  color: white;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 0.875em;
  font-weight: 500;
  transition: all 0.2s ease;
}

.add-word-btn:hover {
  background: #2563eb;
}

/* 加载状态 */
.loading-container {
  text-align: center;
  padding: 80px 20px;
}

.loading-text {
  font-size: 1.125em;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 8px;
}

.loading-subtitle {
  font-size: 0.875em;
  color: #94a3b8;
}

/* 删除对话框 */
.delete-dialog-content {
  text-align: center;
  padding: 16px 0;
}

.delete-title {
  font-size: 1.25em;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.delete-message {
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 8px;
}

.delete-warning-text {
  color: #ef4444;
  font-weight: 500;
}

.delete-dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 16px;
}

.cancel-btn {
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
}

.confirm-delete-btn {
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  background: #ef4444;
  border: none;
}

.confirm-delete-btn:hover {
  background: #dc2626;
}

/* Element Plus 样式覆盖 */

:deep(.el-date-editor .el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  transition: all 0.2s ease;
}

:deep(.el-date-editor .el-input__wrapper:hover) {
  border-color: #3b82f6;
}

:deep(.el-date-editor.is-focus .el-input__wrapper) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.el-button--primary) {
  background: #3b82f6;
  border: none;
}

:deep(.el-button--primary:hover) {
  background: #2563eb;
}

/* 移动端优化样式 */
.mobile-optimized {
  transition: all 0.2s ease;
  cursor: pointer;
}

.mobile-optimized:active {
  transform: scale(0.98);
}

/* 移动端触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .word-card:hover {
    transform: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .word-card:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
  
  .action-btn:hover {
    transform: none;
  }
  
  .action-btn:active {
    transform: scale(0.9);
  }
}

/* 移动端安全区域适配 */
@supports (padding: max(0px)) {
  .view-words-container {
    padding-left: max(8px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
    padding-bottom: max(80px, env(safe-area-inset-bottom));
  }
}

/* 移动端滚动优化 */
.words-list {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* 移动端输入框优化 */
:deep(.el-date-editor.el-input) {
  width: 100%;
}

:deep(.el-date-editor .el-input__inner) {
  font-size: 14px;
  padding: 8px 12px;
}

/* 移动端按钮优化 */
:deep(.el-button--small) {
  padding: 6px 12px;
  font-size: 12px;
}

:deep(.el-button.is-circle) {
  padding: 6px;
}

/* 移动端对话框优化 */
@media (max-width: 480px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 0 auto !important;
  }
  
  :deep(.el-dialog__body) {
    padding: 16px !important;
  }
  
  :deep(.el-dialog__footer) {
    padding: 0 16px 16px !important;
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .words-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .view-words-container {
    padding: 0 12px 80px;
    max-width: 100%;
  }
  
  .page-header {
    padding: 20px 0 16px;
  }
  
  .page-title {
    font-size: 1.5em;
    margin-bottom: 4px;
  }
  
  .page-subtitle {
    font-size: 0.875em;
  }
  
  .top-bar {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    margin-bottom: 20px;
  }
  
  .date-section {
    min-width: 100%;
  }
  
  .section-title {
    font-size: 0.875em;
    margin-bottom: 8px;
    color: #64748b;
  }
  
  .date-controls {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .custom-date-picker {
    flex: 1;
  }
  
  .stats-section {
    width: 100%;
    justify-content: space-between;
  }
  
  .stat-card {
    padding: 12px 16px;
    min-width: 80px;
  }
  
  .stat-number {
    font-size: 1.25em;
  }
  
  .stat-label {
    font-size: 0.75em;
  }
  
  .words-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .word-card {
    padding: 16px;
    border-radius: 12px;
  }
  
  .word-text {
    font-size: 1.25em;
  }
  
  .word-title {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }
  
  .word-actions {
    flex-shrink: 0;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .view-words-container {
    padding: 0 8px 80px;
  }
  
  .page-header {
    padding: 16px 0 12px;
  }
  
  .page-title {
    font-size: 1.375em;
  }
  
  .page-subtitle {
    font-size: 0.813em;
  }
  
  .top-bar {
    padding: 12px;
    gap: 10px;
  }
  
  .date-section,
  .stat-card {
    padding: 10px 12px;
  }
  
  .word-card {
    padding: 14px;
    border-radius: 10px;
  }
  
  .word-text {
    font-size: 1.125em;
  }
  
  .word-pronunciation {
    font-size: 0.813em;
  }
  
  .word-meaning {
    font-size: 0.938em;
  }
  
  .word-example {
    font-size: 0.875em;
  }
  
  .section-label {
    font-size: 0.75em;
  }
  
  .word-date-info {
    font-size: 0.75em;
  }
  
  .word-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .word-actions {
    align-self: flex-end;
  }
  
  .stats-section {
    flex-direction: row;
    gap: 8px;
  }
  
  .stat-card {
    flex: 1;
    min-width: 0;
    padding: 10px 8px;
  }
  
  .stat-number {
    font-size: 1.125em;
  }
  
  .stat-label {
    font-size: 0.688em;
  }
}
</style>