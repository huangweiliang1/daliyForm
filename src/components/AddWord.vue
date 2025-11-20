<template>
  <div class="add-word-container">
    <!-- 背景装饰元素 -->
    <div class="background-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-gradient"></div>
    </div>
    
    <div class="container">
      <!-- 主卡片 -->
      <el-card class="add-word-card gradient-card">
        <template #header>
          <div class="card-header">
            <div class="header-icon">
              <i class="fas fa-plus-circle"></i>
            </div>
            <h2 class="gradient-text">添加单词</h2>
          </div>
        </template>
        
        <el-form
          ref="wordFormRef"
          :model="wordForm"
          :rules="rules"
          label-width="100px"
          class="word-form"
          @submit.prevent
        >
          <!-- 基础信息区域 -->
          <div class="form-section">
            <h3 class="section-title">基础信息</h3>
            <el-row :gutter="16">
              <el-col :xs="24" :sm="12" :md="6">
                <el-form-item label="英语单词" prop="word">
                  <el-input
                    v-model="wordForm.word"
                    placeholder="请输入单词"
                    class="form-input"
                    clearable
                    @input="handleWordInput"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-form-item label="音标" prop="phonetic">
                  <el-input
                    v-model="wordForm.phonetic"
                    placeholder="例如: /wɜːd/"
                    class="form-input"
                    clearable
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-form-item label="词性" prop="partOfSpeech">
                  <el-select
                    v-model="wordForm.partOfSpeech"
                    placeholder="请选择词性"
                    class="form-select"
                    clearable
                  >
                    <el-option label="名词" value="n."></el-option>
                    <el-option label="动词" value="v."></el-option>
                    <el-option label="形容词" value="adj."></el-option>
                    <el-option label="副词" value="adv."></el-option>
                    <el-option label="介词" value="prep."></el-option>
                    <el-option label="连词" value="conj."></el-option>
                    <el-option label="代词" value="pron."></el-option>
                    <el-option label="数词" value="num."></el-option>
                    <el-option label="感叹词" value="interj."></el-option>
                    <el-option label="其他" value="other"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12" :md="6">
                <el-form-item label="同义词/反义词" prop="synonyms">
                  <el-input
                    v-model="wordForm.synonyms"
                    placeholder="用逗号分隔"
                    class="form-input"
                    clearable
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            
            <el-row :gutter="16">
              <el-col :xs="24" :md="12">
                <el-form-item label="中文意思" prop="meaning">
                  <el-input
                    v-model="wordForm.meaning"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入中文意思"
                    class="form-textarea"
                    resize="vertical"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :md="12">
                <el-form-item label="例句" prop="example">
                  <el-input
                    v-model="wordForm.example"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入例句"
                    class="form-textarea"
                    resize="vertical"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 扩展信息区域 -->
          <div class="form-section">
            <h3 class="section-title">扩展信息</h3>
            <el-row :gutter="16">
              <el-col :xs="24" :sm="12">
                <el-form-item label="标签" prop="tags">
                  <el-input
                    v-model="wordForm.tags"
                    placeholder="用逗号分隔，例如：常用, 商务"
                    class="form-input"
                    clearable
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :xs="24" :sm="12">
                <el-form-item label="日期" prop="date">
                  <el-date-picker
                    v-model="wordForm.date"
                    type="date"
                    placeholder="选择日期"
                    value-format="YYYY-MM-DD"
                    class="form-datepicker"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <el-button
              @click="resetForm"
              :loading="submitting"
              class="clear-btn"
            >
              <i class="fas fa-redo"></i>
              重置
            </el-button>
            <el-button
              @click="submitForm"
              :loading="submitting"
              class="search-btn"
            >
              <i class="fas fa-save"></i>
              保存单词
            </el-button>
          </div>
        </el-form>
      </el-card>

      <!-- 数据管理功能已移至专门的"数据管理"标签页 -->

      <!-- 快速添加区域 -->
      <el-card class="quick-add-card gradient-card mobile-quick-add-card">
        <template #header>
          <div class="card-header mobile-card-header">
            <div class="header-icon mobile-header-icon">
              <i class="fas fa-bolt"></i>
            </div>
            <h2 class="gradient-text mobile-gradient-text">快速添加</h2>
          </div>
        </template>
        
        <div class="quick-add-content mobile-quick-add-content">
          <el-input
            v-model="quickAddText"
            placeholder="格式：单词-释义，例如：apple-苹果"
            class="form-input quick-add-input mobile-quick-add-input"
            clearable
            @keyup.enter="quickAdd"
            show-word-limit
            maxlength="100"
            size="large"
          ></el-input>
          <el-button
            @click="quickAdd"
            :loading="submitting"
            class="quick-add-btn mobile-quick-add-btn"
            size="large"
          >
            <i class="fas fa-plus"></i>
            快速添加
          </el-button>
        </div>
        
        <div v-if="recentAddedWords.length > 0" class="recent-words mobile-recent">
          <h4 class="mobile-title">最近添加：</h4>
          <div class="recent-words-list mobile-list">
            <el-tag
              v-for="(word, index) in recentAddedWords"
              :key="index"
              :closable="true"
              :effect="'plain'"
              class="recent-word-tag mobile-tag"
              size="small"
              @close="removeRecentWord(index)"
            >
              {{ word }}
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useWordStore } from '../stores/wordStore'

export default {
  name: 'AddWord',
  emits: ['word-added', 'switch-tab'],
  setup(props, { emit }) {
    // 使用wordStore
    const wordStore = useWordStore()
    
    const wordFormRef = ref(null)
    const fileInputRef = ref(null)
    const submitting = ref(false)
    const quickAddText = ref('')
    const recentAddedWords = ref([])
    
    // 单词表单数据
    const wordForm = reactive({
      word: '',
      phonetic: '',
      partOfSpeech: '',
      meaning: '',
      example: '',
      tags: '',
      synonyms: '',
      date: new Date().toISOString().split('T')[0]
    })

    // 计算今日新增单词数量
    const todayAddedCount = computed(() => {
      const today = new Date().toISOString().split('T')[0]
      return wordStore.words.filter(word => word.date === today).length
    })
    
    // 表单验证规则
    const rules = {
      word: [
        { required: true, message: '请输入单词', trigger: 'blur' },
        { pattern: /^[\w\s\-\']+$/, message: '单词不能包含中文字符或特殊字符', trigger: 'blur' }
      ],
      meaning: [
        { required: true, message: '请输入中文意思', trigger: 'blur' }
      ],
      date: [
        { required: true, message: '请选择日期', trigger: 'change' }
      ]
    }

    // 处理单词输入
    const handleWordInput = () => {
      // 自动将单词转换为小写
      wordForm.word = wordForm.word.toLowerCase()
    }

    // 验证单词是否已存在
    const checkWordExists = (word) => {
      return wordStore.words.some(w => w.word.toLowerCase() === word.toLowerCase())
    }

    // 保存单词
    const saveWord = async () => {
      // 处理标签
      const tags = wordForm.tags
        ? wordForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : []
      
      // 创建新单词对象
      const newWord = {
        word: wordForm.word.trim(),
        phonetic: wordForm.phonetic.trim(),
        partOfSpeech: wordForm.partOfSpeech,
        meaning: wordForm.meaning.trim(),
        example: wordForm.example.trim(),
        tags,
        synonyms: wordForm.synonyms.trim(),
        date: wordForm.date
      }
      
      // 使用wordStore添加单词
      await wordStore.addWord(newWord)
      
      // 等待一小段时间确保数据已保存到IndexedDB
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 更新最近添加的单词
      recentAddedWords.value.unshift(newWord.word)
      if (recentAddedWords.value.length > 5) {
        recentAddedWords.value = recentAddedWords.value.slice(0, 5)
      }
      
      // 发送单词已添加事件
      emit('word-added', newWord)
      
      // 触发自定义事件，通知其他组件单词已更新
      const event = new CustomEvent('wordUpdated', { detail: newWord })
      window.dispatchEvent(event)
      
      // 再次触发事件确保通知到位
      setTimeout(() => {
        const retryEvent = new CustomEvent('wordUpdated', { detail: newWord })
        window.dispatchEvent(retryEvent)
      }, 200)
      
      return newWord
    }

    // 提交表单
    const submitForm = () => {
      wordFormRef.value?.validate(async (valid) => {
        if (valid) {
          // 检查单词是否已存在
          if (checkWordExists(wordForm.word)) {
            ElMessage.warning('该单词已存在，请检查是否拼写错误或尝试添加其他单词')
            return
          }
          
          submitting.value = true
          
          try {
            // 使用wordStore保存单词
            await saveWord()
            
            ElMessage.success({
              message: '单词添加成功！',
              duration: 2000,
              showClose: true
            })
            
            // 重置表单
            resetForm()
          } catch (error) {
            console.error('添加单词失败:', error)
            ElMessage.error('添加单词失败，请重试')
          } finally {
            submitting.value = false
          }
        }
      })
    }

    // 重置表单
    const resetForm = () => {
      wordFormRef.value?.resetFields()
      Object.assign(wordForm, {
        word: '',
        phonetic: '',
        partOfSpeech: '',
        meaning: '',
        example: '',
        tags: '',
        synonyms: '',
        date: new Date().toISOString().split('T')[0]
      })
    }

    // 快速添加单词
    const quickAdd = async () => {
      if (!quickAddText.value.trim()) {
        ElMessage.warning('请输入单词和释义')
        return
      }
      
      const parts = quickAddText.value.trim().split('-')
      if (parts.length < 2) {
        ElMessage.warning('格式错误，请使用：单词-释义')
        return
      }
      
      const word = parts[0].trim()
      const meaning = parts.slice(1).join('-').trim()
      
      if (!word || !meaning) {
        ElMessage.warning('单词和释义不能为空')
        return
      }
      
      // 检查单词是否已存在
      if (checkWordExists(word)) {
        ElMessage.warning('该单词已存在')
        quickAddText.value = ''
        return
      }
      
      submitting.value = true
      
      try {
        // 更新表单数据
        wordForm.word = word
        wordForm.meaning = meaning
        
        // 保存单词
        await saveWord()
        
        ElMessage.success({
          message: '快速添加成功！',
          duration: 1500,
          showClose: true
        })
        
        // 清空快速添加输入
        quickAddText.value = ''
        
        // 重置表单的其他字段，但保留当前日期
        const currentDate = wordForm.date
        resetForm()
        wordForm.date = currentDate
      } catch (error) {
        console.error('快速添加失败:', error)
        ElMessage.error('添加失败，请重试')
      } finally {
        submitting.value = false
      }
    }

    // 移除最近添加的单词
    const removeRecentWord = (index) => {
      recentAddedWords.value.splice(index, 1)
    }
    
    // 处理编辑单词事件
    const handleEditWord = (event) => {
      const word = event.detail
      if (!word) return
      
      // 填充表单
      wordForm.word = word.word || ''
      wordForm.phonetic = word.phonetic || ''
      wordForm.partOfSpeech = word.partOfSpeech || ''
      wordForm.meaning = word.meaning || ''
      wordForm.example = word.example || ''
      wordForm.tags = Array.isArray(word.tags) ? word.tags.join(', ') : (word.tags || '')
      wordForm.synonyms = word.synonyms || ''
      wordForm.date = word.date || new Date().toISOString().split('T')[0]
      
      // 显示编辑提示
      ElMessage.info({
        message: '正在编辑单词，请修改后保存',
        duration: 2000,
        showClose: true
      })
      
      // 切换到添加单词页面
      emit('switch-tab', 'add')
    }
    
    // 注意：导入导出相关功能已移至"数据管理"标签页
    // 这些函数已被移除，请使用"数据管理"标签页中的功能

    // 监听窗口大小变化，调整表单布局
    const handleResize = () => {
      // 这里可以添加响应式布局调整逻辑
    }

    // 监听键盘弹出事件
const handleKeyboardToggle = () => {
  if (typeof window !== 'undefined') {
    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;
    
    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDiff = initialViewportHeight - currentHeight;
      
      // 如果高度差超过150px，认为键盘弹出了
      if (heightDiff > 150) {
        document.body.classList.add('keyboard-open');
        // 滚动到当前聚焦的输入框
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          setTimeout(() => {
            activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
        }
      } else {
        document.body.classList.remove('keyboard-open');
      }
    };
    
    // 监听视觉视口变化
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    } else {
      // 降级方案：监听窗口大小变化和焦点事件
      window.addEventListener('resize', handleViewportChange);
      document.addEventListener('focusin', handleViewportChange);
      document.addEventListener('focusout', handleViewportChange);
    }
    
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      } else {
        window.removeEventListener('resize', handleViewportChange);
        document.removeEventListener('focusin', handleViewportChange);
        document.removeEventListener('focusout', handleViewportChange);
      }
    };
  }
};

// 移动端触摸优化
const setupMobileOptimizations = () => {
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    // 防止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
    
    // 优化输入框聚焦
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        // 延迟滚动，确保键盘完全弹出
        setTimeout(() => {
          input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      });
    });
    
    // 添加触摸反馈
    const touchElements = document.querySelectorAll('.el-button, .recent-word-item');
    touchElements.forEach(element => {
      element.addEventListener('touchstart', () => {
        element.style.transform = 'scale(0.98)';
      });
      
      element.addEventListener('touchend', () => {
        element.style.transform = 'scale(1)';
      });
    });
  }
};

// 组件挂载时
onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('edit-word', handleEditWord)
  
  // 设置移动端优化
  const cleanupKeyboard = handleKeyboardToggle();
  setupMobileOptimizations();
  
  // 清理函数
  onUnmounted(() => {
    if (cleanupKeyboard) {
      cleanupKeyboard();
    }
  });
})

    // 组件卸载时
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('edit-word', handleEditWord)
    })

    // 监听表单变化，提供实时反馈
    watch(
      () => [wordForm.word, wordForm.meaning],
      ([newWord, newMeaning]) => {
        // 这里可以添加实时验证逻辑
      }
    )

    return {
      wordFormRef,
      wordForm,
      rules,
      submitting,
      quickAddText,
      recentAddedWords,
      todayAddedCount,
      wordStore,
      handleWordInput,
      submitForm,
      resetForm,
      quickAdd,
      removeRecentWord,
      handleEditWord
    }
  }
}
</script>

<style scoped>
/* 现代化CSS变量 */
:root {
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --warning-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  --glass-bg: rgba(255, 255, 255, 0.25);
  --glass-border: rgba(255, 255, 255, 0.18);
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --text-muted: #718096;
  --bg-primary: #ffffff;
  --bg-secondary: #f7fafc;
  --bg-tertiary: #edf2f7;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1), 0 6px 10px rgba(0, 0, 0, 0.08);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  --transition-fast: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 主容器 */
.add-word-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 动态背景 */
.dynamic-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.6;
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 250px;
  height: 250px;
  background: linear-gradient(135deg, #a8e6cf, #dcedc1);
  top: 60%;
  right: 15%;
  animation-delay: 5s;
}

.shape-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #ffd3b6, #ffaaa5);
  bottom: 20%;
  left: 20%;
  animation-delay: 10s;
}

.shape-4 {
  width: 350px;
  height: 350px;
  background: linear-gradient(135deg, #8e44ad, #3498db);
  top: 30%;
  right: 30%;
  animation-delay: 15s;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.1) 0%, 
    rgba(118, 75, 162, 0.1) 50%, 
    rgba(102, 126, 234, 0.1) 100%);
}

/* 主要内容区域 */
.main-content {
  position: relative;
  z-index: 1;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* 页面标题区域 */
.page-header {
  margin-bottom: 2rem;
  animation: slideDown 0.6s ease-out;
}

.header-content {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--glass-border);
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-lg);
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  background: var(--primary-gradient);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: var(--shadow-md);
  animation: pulse 2s infinite;
}

.title-text h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.title-text p {
  margin: 0.5rem 0 0 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

.stats-section {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  background: var(--success-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  display: block;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-color);
}

/* 内容网格布局 */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  animation: fadeInUp 0.8s ease-out;
}

/* 表单区域 */
.form-section {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.section-header {
  background: var(--primary-gradient);
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.section-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
}

.section-header h2 {
  margin: 0;
  color: white;
  font-size: 1.3rem;
  font-weight: 600;
}

.section-badge {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.form-container {
  padding: 2rem;
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.form-group {
  position: relative;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group.primary {
  position: relative;
}

.form-group.primary::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: var(--primary-gradient);
  border-radius: var(--radius-md);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
}

.form-group.primary:hover::after {
  opacity: 0.1;
}

.input-wrapper {
  position: relative;
}

.input-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.input-hint::before {
  content: '💡';
}

/* 现代化输入框样式 */
:deep(.modern-input .el-input__wrapper),
:deep(.modern-select .el-select__wrapper),
:deep(.modern-datepicker .el-input__wrapper) {
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  padding: 0.75rem 1rem;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

:deep(.modern-input .el-input__wrapper:hover),
:deep(.modern-select .el-select__wrapper:hover),
:deep(.modern-datepicker .el-input__wrapper:hover) {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

:deep(.modern-input .el-input__wrapper.is-focus),
:deep(.modern-select .el-select__wrapper.is-focus),
:deep(.modern-datepicker .el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

/* 移动端触摸反馈 */
@media (hover: none) and (pointer: coarse) {
  :deep(.modern-input .el-input__wrapper:active),
  :deep(.modern-select .el-select__wrapper:active),
  :deep(.modern-datepicker .el-input__wrapper:active) {
    transform: scale(0.98);
    background-color: var(--bg-primary);
    border-color: #667eea;
  }
}

:deep(.modern-textarea .el-textarea__inner) {
  background: var(--bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  padding: 0.75rem 1rem;
  resize: vertical;
  min-height: 80px;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

:deep(.modern-textarea .el-textarea__inner:hover) {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

:deep(.modern-textarea .el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

/* 移动端文本域触摸反馈 */
@media (hover: none) and (pointer: coarse) {
  :deep(.modern-textarea .el-textarea__inner:active) {
    transform: scale(0.98);
    background-color: var(--bg-primary);
    border-color: #667eea;
  }
}

/* 选项样式 */
.option-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 操作按钮 */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  min-width: 140px;
  height: 48px;
  border-radius: var(--radius-md);
  font-weight: 600;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.primary-btn {
  background: var(--primary-gradient);
  border: none;
  color: white;
  box-shadow: var(--shadow-md);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.secondary-btn {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  color: var(--text-secondary);
}

.secondary-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 侧边栏区域 */
.sidebar-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 小组件样式 */
.quick-add-widget,
.recent-widget,
.tips-widget {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.quick-add-widget:hover,
.recent-widget:hover,
.tips-widget:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.widget-header {
  background: var(--bg-secondary);
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid var(--border-color);
}

.widget-icon {
  width: 32px;
  height: 32px;
  background: var(--primary-gradient);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
}

.widget-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.widget-content {
  padding: 1.5rem;
}

/* 快速添加表单 */
.quick-add-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

:deep(.quick-input .el-input__wrapper) {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

:deep(.quick-input .el-input__wrapper:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.quick-btn {
  width: 100%;
  height: 44px;
  background: var(--success-gradient);
  border: none;
  border-radius: var(--radius-md);
  color: white;
  font-weight: 600;
  transition: all var(--transition-normal);
}

.quick-btn:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.format-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  padding: 0.75rem;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

/* 最近添加列表 */
.recent-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.recent-item:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
}

.recent-word {
  font-weight: 500;
  color: var(--text-primary);
}

.remove-btn {
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.remove-btn:hover {
  color: #f56565;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-muted);
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* 学习提示 */
.tip-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.tip-item:hover {
  background: var(--bg-secondary);
  transform: translateX(4px);
}

.tip-item i {
  color: #48bb78;
  font-size: 0.875rem;
}

.tip-item span {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* 动画定义 */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(20px) rotate(240deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 移动端专用动画效果 */
@keyframes inputFocus {
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
}

@keyframes buttonPress {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-2px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(2px);
  }
}

/* 移动端动画应用 */
@media (max-width: 768px) {
  .form-section {
    animation: fadeInUp 0.5s ease-out;
    animation-fill-mode: both;
  }

  .form-section:nth-child(1) {
    animation-delay: 0.1s;
  }

  .form-section:nth-child(2) {
    animation-delay: 0.2s;
  }

  .add-word-card {
    animation: fadeInUp 0.5s ease-out 0.3s both;
  }

  .quick-add-card {
    animation: fadeInUp 0.5s ease-out 0.4s both;
  }

  .recent-word-tag {
    animation: slideInRight 0.3s ease-out;
    animation-fill-mode: both;
  }

  .recent-word-tag:nth-child(1) { animation-delay: 0.05s; }
  .recent-word-tag:nth-child(2) { animation-delay: 0.1s; }
  .recent-word-tag:nth-child(3) { animation-delay: 0.15s; }
  .recent-word-tag:nth-child(4) { animation-delay: 0.2s; }
  .recent-word-tag:nth-child(5) { animation-delay: 0.25s; }

  /* 按钮点击动画 */
  .form-actions .el-button {
    transition: all 0.3s ease;
  }

  .form-actions .el-button:active {
    animation: buttonPress 0.2s ease;
  }

  /* 输入框错误抖动 */
  .el-form-item.is-error {
    .el-input__wrapper,
    .el-textarea__inner {
      animation: shake 0.5s ease;
    }
  }

  /* 成功提示动画 */
  .el-message.el-message--success {
    animation: fadeInUp 0.3s ease;
  }

  /* 加载状态动画 */
  .el-button.is-loading {
    .el-icon {
      animation: pulse 1.5s ease infinite;
    }
  }

  /* 触摸反馈动画 */
  .recent-word-tag {
    transition: all 0.3s ease;
  }

  .recent-word-tag:active {
    animation: pulse 0.2s ease;
  }

  /* 表单验证反馈 */
  .el-form-item.is-success {
    .el-input__wrapper,
    .el-textarea__inner {
      border-color: #10b981;
      background-color: #f0fdf4;
    }
  }

  /* 选择器展开动画 */
  .el-select-dropdown {
    animation: fadeInUp 0.2s ease;
  }

  /* 日期选择器面板动画 */
  .el-picker-panel {
    animation: fadeInUp 0.3s ease;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent !important;
  border-bottom: none !important;
  padding: 1rem 1.5rem 1rem 1.5rem !important;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4361ee 0%, #4cc9f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
  animation: float 6s ease-in-out infinite;
}

.gradient-text {
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  margin: 0;
}

.add-word-card, .quick-add-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 1rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  margin-bottom: 2rem;
}

.add-word-card::before, .quick-add-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4361ee, #4cc9f0, #ef4444, #10b981);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.add-word-card:hover::before, .quick-add-card:hover::before {
  opacity: 1;
}

.add-word-card .card-header, .quick-add-card .card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border-bottom: none;
  padding: 1rem 1.5rem 1rem 1.5rem;
}

.add-word-card .card-header h2, .quick-add-card .card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.add-word-card .card-header h2 i, .quick-add-card .card-header h2 i {
  display: none;
}

.add-word-card .card-header h2 i {
  font-size: 1.2rem;
  color: #4361ee;
  animation: pulse 2s infinite;
}

.quick-add-card .card-header h2 i {
  font-size: 1.2rem;
  color: #10b981;
  animation: bounce 1.5s infinite;
}

/* 表单样式 */
.word-form {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0.75rem;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.section-title {
  margin: 0 0 1.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #4361ee;
  border-bottom: 2px solid rgba(67, 97, 238, 0.3);
  padding-bottom: 8px;
  display: inline-block;
}

.form-input,
.form-select,
.form-datepicker,
.form-textarea {
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  border-color: #f1f5f9;
}

.form-input:focus,
.form-select:focus,
.form-datepicker:focus,
.form-textarea:focus {
  box-shadow: 0 0 0 2px rgba(67, 97, 238, 0.2);
  border-color: rgba(67, 97, 238, 0.3);
}

.form-textarea {
  min-height: 80px;
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.action-btn {
  min-width: 120px;
  border-radius: 9999px;
  font-size: 1rem;
  padding: 10px 24px;
  transition: all 0.3s ease;
  border-width: 2px;
}

.submit-btn {
  background: var(--gradient-primary);
  border: none;
  color: white;
}

.submit-btn:hover {
  background: var(--gradient-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.reset-btn {
  border-color: #f1f5f9;
}

.reset-btn:hover {
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* 快速添加区域样式 */
.quick-add-content {
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: stretch;
}

.quick-add-input {
  flex: 1;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
}

.quick-add-input:focus {
  box-shadow: 0 0 0 2px rgba(76, 201, 240, 0.2);
  border-color: #10b981;
}

.quick-add-btn {
  border-radius: 9999px;
  background: linear-gradient(135deg, #4cc9f0, #4895ef);
  border: none;
  color: white;
  transition: all 0.3s ease;
  /* 移除nowrap属性，允许文本在必要时换行 */
  min-width: 100px;
  font-size: 1rem;
}

.quick-add-btn:hover {
  background: #10b981;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 最近添加区域样式 */
.recent-words {
  padding: 0 1.5rem 1.5rem;
}

.recent-words h4 {
  margin: 0 0 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
}

.recent-words-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.recent-word-tag {
  border-radius: 9999px;
  transition: all 0.15s ease;
  animation: fadeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.recent-word-tag:hover {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

/* 动画定义 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

/* 移动端专用样式 */
@media (max-width: 768px) {
  .add-word-container {
    padding: 12px;
    max-width: 100%;
  }

  .add-word-header {
    padding: 16px 0;
    margin-bottom: 20px;
  }

  .add-word-title {
    font-size: 22px;
    margin-bottom: 8px;
  }

  .add-word-subtitle {
    font-size: 13px;
    padding: 8px 12px;
    border-radius: 8px;
  }

  .word-form.mobile-optimized {
    .el-form-item {
      margin-bottom: 20px;
    }

    .el-form-item__label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
      line-height: 1.5;
      padding-bottom: 6px;
    }

    .el-input,
    .el-select,
    .el-textarea {
      width: 100%;
    }

    .el-input__inner,
    .el-textarea__inner {
      font-size: 16px;
      padding: 12px 16px;
      border-radius: 10px;
      border: 2px solid #e5e7eb;
      transition: all 0.3s ease;
      background-color: #f9fafb;
    }

    .el-input__inner:focus,
    .el-textarea__inner:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      background-color: #ffffff;
    }

    .el-select .el-input__inner {
      height: 48px;
      line-height: 48px;
    }
  }

  .form-section {
    background: #ffffff;
    border-radius: 16px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #f3f4f6;
  }

  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f3f4f6;
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      color: #6366f1;
      font-size: 14px;
    }
  }

  .mobile-form-group {
    .el-row {
      margin: 0 -6px;
    }

    .el-col {
      padding: 0 6px;
    }
  }

  .form-actions.mobile-actions {
    display: flex;
    gap: 12px;
    padding: 20px;
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    position: sticky;
    bottom: 0;
    z-index: 10;
    margin-top: 20px;
  }

  .mobile-btn {
    flex: 1;
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 12px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    &:active {
      transform: scale(0.98);
    }
  }

  .primary-btn {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    border: none;
    color: #ffffff;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);

    &:hover {
      background: linear-gradient(135deg, #5558e3 0%, #7c3aed 100%);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
    }
  }

  .clear-btn {
    background: #f3f4f6;
    border: 2px solid #e5e7eb;
    color: #6b7280;

    &:hover {
      background: #e5e7eb;
      color: #4b5563;
    }
  }

  /* 快速添加区域移动端优化 */
  .quick-add-section.mobile-quick-add {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 24px;
    border: 2px solid #ddd6fe;
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.15);
  }

  .quick-add-header {
    margin-bottom: 20px;
    text-align: center;
  }

  .quick-add-desc {
    font-size: 13px;
    color: #6b7280;
    margin-top: 8px;
    line-height: 1.5;
  }

  .quick-add-content {
    .mobile-textarea .el-textarea__inner {
      font-size: 14px;
      line-height: 1.6;
      padding: 16px;
      background: #ffffff;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      min-height: 120px;
    }
  }

  .quick-add-options {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 16px 0;
    padding: 12px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
  }

  .mobile-checkbox {
    font-size: 14px;
    color: #4b5563;
  }

  .quick-add-help {
    color: #9ca3af;
    font-size: 14px;
    cursor: help;
  }

  /* 最近添加区域移动端优化 */
  .recent-words-section.mobile-recent {
    background: #ffffff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #f3f4f6;
  }

  .recent-words-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #f3f4f6;
  }

  .mobile-clear-btn {
    font-size: 13px;
    color: #ef4444;
    padding: 6px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: #fef2f2;
      color: #dc2626;
    }
  }

  .recent-words-list.mobile-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .recent-word-item.mobile-item {
    padding: 16px;
    background: #f9fafb;
    border-radius: 12px;
    border: 2px solid #f3f4f6;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 60px;

    &:hover {
      background: #f3f4f6;
      border-color: #e5e7eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: translateY(0) scale(0.98);
    }
  }

  .recent-word-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .recent-word-text {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
  }

  .recent-word-meaning {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.4;
  }

  .recent-word-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-right: 12px;
  }

  .word-tag {
    font-size: 11px;
    padding: 4px 8px;
    background: #e0e7ff;
    color: #4338ca;
    border-radius: 6px;
    font-weight: 500;
  }

  .word-date {
    font-size: 11px;
    color: #9ca3af;
  }

  .recent-word-arrow {
    color: #d1d5db;
    font-size: 12px;
    transition: all 0.3s ease;
  }

  .recent-word-item:hover .recent-word-arrow {
    color: #6366f1;
    transform: translateX(2px);
  }

  /* 触摸优化 */
  .el-input__inner,
  .el-textarea__inner,
  .el-button {
    -webkit-tap-highlight-color: transparent;
    outline: none;
  }

  /* 安全区域适配 */
  @supports (padding: max(0px)) {
    .add-word-container {
      padding-left: max(12px, env(safe-area-inset-left));
      padding-right: max(12px, env(safe-area-inset-right));
      padding-bottom: max(12px, env(safe-area-inset-bottom));
    }

    .form-actions.mobile-actions {
      padding-bottom: max(20px, env(safe-area-inset-bottom));
    }
  }

  /* 横屏优化 */
  @media (max-width: 768px) and (orientation: landscape) {
    .add-word-container {
      padding: 8px;
    }

    .form-section {
      padding: 16px;
      margin-bottom: 16px;
    }

    .quick-add-section.mobile-quick-add {
      padding: 16px;
      margin-bottom: 16px;
    }

    .recent-words-section.mobile-recent {
      padding: 16px;
    }

    .mobile-textarea .el-textarea__inner {
      min-height: 80px;
    }
  }

  /* 小屏幕优化 */
  @media (max-width: 480px) {
    .add-word-container {
      padding: 8px;
    }

    .add-word-title {
      font-size: 20px;
    }

    .form-section {
      padding: 16px;
      border-radius: 12px;
    }

    .section-title {
      font-size: 15px;
    }

    .mobile-form-group .el-col {
      padding: 0 4px;
    }

    .form-actions.mobile-actions {
      padding: 16px;
      gap: 8px;
    }

    .mobile-btn {
      height: 44px;
      font-size: 15px;
    }

    .quick-add-section.mobile-quick-add {
      padding: 20px;
      border-radius: 16px;
    }

    .recent-word-item.mobile-item {
      padding: 14px;
      min-height: 56px;
    }

    .recent-word-text {
      font-size: 15px;
    }

    .recent-word-meaning {
      font-size: 12px;
    }
  }

  /* 超小屏幕优化 */
  @media (max-width: 375px) {
    .add-word-title {
      font-size: 18px;
    }

    .section-title {
      font-size: 14px;
    }

    .mobile-btn {
      height: 40px;
      font-size: 14px;
    }

    .form-actions.mobile-actions {
      padding: 12px;
    }

    .quick-add-section.mobile-quick-add {
      padding: 16px;
    }

    .recent-word-item.mobile-item {
      padding: 12px;
      min-height: 52px;
    }
  }
}

@media (max-width: 480px) {
  .add-word-container {
    padding: 8px;
  }
  
  .word-form {
    padding: 0.75rem;
  }
  
  .form-section {
    padding: 0.75rem;
  }
  
  .quick-add-content {
    padding: 0.75rem;
  }
  
  .recent-words {
    padding: 0 0.75rem 0.75rem;
  }
}





/* 表单验证错误样式优化 */
:deep(.el-form-item.is-error .el-input__wrapper) {
  border-color: #f56c6c;
}

:deep(.el-form-item__error) {
  font-size: 0.875rem;
  color: #f56c6c;
  animation: shake 0.5s ease-in-out;
  padding-top: 0.25rem;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-3px);
  }
  75% {
    transform: translateX(3px);
  }
}

/* 滚动条样式优化 */
.add-word-container {
  /* Webkit浏览器滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
    transition: background 0.3s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* 移动端滚动优化 */
  @media (max-width: 768px) {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
    
    /* 优化滚动性能 */
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    
    /* 键盘弹出时的适配 */
    .form-actions {
      transition: all 0.3s ease;
    }
    
    /* 输入框聚焦时的处理 */
    .el-input.is-focus,
    .el-textarea.is-focus {
      /* 确保输入框在可视区域内 */
      scroll-margin-top: 20px;
      scroll-margin-bottom: 100px;
    }
    
    /* 文本域聚焦时的特殊处理 */
    .el-textarea.is-focus {
      .el-textarea__inner {
        min-height: 120px; /* 聚焦时增加高度 */
      }
    }
  }
}

/* 移动端键盘适配 */
@media (max-width: 768px) {
  /* 当键盘弹出时调整布局 */
  .keyboard-open {
    .form-actions {
      position: relative;
      bottom: auto;
      margin-bottom: 20px;
    }
    
    .quick-add-card {
      margin-bottom: 20px;
    }
  }
  
  /* 输入框类型优化 */
  .el-input__inner[type="text"] {
    /* 自动大写关闭 */
    text-transform: none;
    /* 自动更正关闭 */
    autocorrect: off;
    /* 自动完成关闭 */
    autocomplete: off;
    /* 拼写检查关闭 */
    spellcheck: false;
  }
  
  /* 文本域优化 */
  .el-textarea__inner {
    /* 自动大写关闭 */
    text-transform: none;
    /* 自动更正关闭 */
    autocorrect: off;
    /* 拼写检查关闭 */
    spellcheck: false;
  }
}

/* 移动端触摸优化 */
@media (max-width: 768px) {
  /* 增大触摸区域 */
  .el-form-item__label {
    min-height: 44px;
    display: flex;
    align-items: center;
  }
  
  .el-input__inner,
  .el-textarea__inner {
    min-height: 44px;
  }
  
  .el-select .el-input__inner {
    min-height: 44px;
  }
  
  .el-button {
    min-height: 44px;
  }
  
  /* 触摸反馈 */
  .el-input__inner:active,
  .el-textarea__inner:active,
  .el-button:active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  /* 防止双击缩放 */
  .el-input__inner,
  .el-textarea__inner,
  .el-button,
  .recent-word-tag {
    touch-action: manipulation;
  }
  
  /* 长按选择优化 */
  .el-input__inner,
  .el-textarea__inner {
    -webkit-user-select: text;
    user-select: text;
  }
  
  /* 防止页面滚动穿透 */
  .el-select-dropdown,
  .el-picker-panel {
    position: fixed;
    z-index: 9999;
  }
  
  /* 模态框背景防止滚动 */
  .el-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9998;
  }
}

/* 按钮样式优化 */
:deep(.el-button) {
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  position: relative;
  overflow: hidden;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #4361ee, #4cc9f0);
  border: none;
  transition: all 0.3s ease;
}

:deep(.el-button--primary:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  opacity: 0.95;
}

:deep(.el-button--default) {
  border-color: #e2e8f0;
  transition: all 0.3s ease;
}

:deep(.el-button--default:hover) {
  border-color: #4361ee;
  color: #4361ee;
  transform: translateY(-1px);
}

/* 移动端按钮触摸反馈 */
@media (hover: none) and (pointer: coarse) {
  :deep(.el-button) {
    min-height: 44px; /* iOS推荐的最小触摸目标 */
  }
  
  :deep(.el-button:active) {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
  
  :deep(.el-button--primary:active) {
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  :deep(.el-button--default:active) {
    background-color: #f3f4f6;
    border-color: #6366f1;
  }
}

/* 按钮涟漪效果 */
:deep(.el-button::after) {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

:deep(.el-button:active::after) {
  width: 300px;
  height: 300px;
}

/* 输入框聚焦动画 */
.form-input,
.form-textarea,
.form-select,
.form-datepicker {
  position: relative;
  overflow: hidden;
}

.form-input:focus::after,
.form-textarea:focus::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(67, 97, 238, 0.1), transparent);
  animation: shimmer 1s;
}

@keyframes shimmer {
  100% {
    left: 100%;
  }
}
</style>