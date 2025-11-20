<template>
  <div class="practice-words">
    <!-- 背景装饰元素 -->
    <div class="bg-gradient"></div>
    <div class="bg-circle"></div>
    <div class="bg-circle"></div>
    <!-- 标题和返回按钮 -->
    <div class="practice-header">
      <div v-if="currentStep !== 'mode-selection'" class="back-button">
        <button @click="goBack" class="back-btn">返回</button>
      </div>
      <h2>单词练习</h2>
    </div>
    <!-- 模式选择 -->
    <div v-if="currentStep === 'mode-selection'" class="mode-selection">
      <div class="mode-intro">
        <h2>选择练习模式</h2>
        <p>通过不同的方式来巩固你的单词记忆</p>
      </div>
      
      <div class="mode-cards">
        <div class="mode-card flashcard-mode-card" @click="selectMode('flashcard')">
          <div class="mode-icon">
            <i class="fas fa-layer-group"></i>
          </div>
          <div class="mode-content">
            <h3>闪卡模式</h3>
            <p>通过翻转卡片来记忆单词和释义</p>
          </div>
          <div class="mode-features">
            <span class="feature-tag">视觉记忆</span>
            <span class="feature-tag">自主学习</span>
          </div>
        </div>
        
        <div class="mode-card quiz-mode-card" @click="selectMode('quiz')">
          <div class="mode-icon">
            <i class="fas fa-question-circle"></i>
          </div>
          <div class="mode-content">
            <h3>测验模式</h3>
            <p>通过选择题来测试你的掌握程度</p>
          </div>
          <div class="mode-features">
            <span class="feature-tag">快速测试</span>
            <span class="feature-tag">即时反馈</span>
          </div>
        </div>
        
        <div class="mode-card listening-mode-card" @click="selectMode('listening')">
          <div class="mode-icon">
            <i class="fas fa-headphones"></i>
          </div>
          <div class="mode-content">
            <h3>听力模式</h3>
            <p>通过听音辨词来提升听力能力</p>
          </div>
          <div class="mode-features">
            <span class="feature-tag">听力训练</span>
            <span class="feature-tag">发音练习</span>
          </div>
        </div>
      </div>
      
      <div class="practice-stats">
        <div class="stat-item">
          <div class="stat-number">1500+</div>
          <div class="stat-label">词汇量</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">3</div>
          <div class="stat-label">练习模式</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">∞</div>
          <div class="stat-label">练习次数</div>
        </div>
      </div>
    </div>

    <!-- 练习设置 -->
    <div v-else-if="currentStep === 'settings'" class="practice-settings">
      <h2>练习设置</h2>
      
      <div class="settings-group">
        <label>练习单词数量</label>
        <input 
          type="number" 
          v-model="settings.wordCount" 
          min="1" 
          max="50"
          placeholder="输入单词数量"
        >
      </div>
      
      <div class="settings-group">
        <label>难度级别</label>
        <select v-model="settings.difficulty">
          <option value="全部">全部</option>
          <option value="简单">简单</option>
          <option value="中等">中等</option>
          <option value="困难">困难</option>
        </select>
      </div>
      
      <div class="settings-group">
        <label>单词范围</label>
        <div class="radio-group">
          <label>
            <input type="radio" v-model="settings.wordRange" value="today">
            今天的单词
          </label>
          <label>
            <input type="radio" v-model="settings.wordRange" value="all">
            所有单词
          </label>
        </div>
      </div>
      
      <div class="settings-actions">
        <button class="back-btn" @click="() => { backToModeSelection(); refreshPage(); }">返回</button>
        <button class="start-btn" @click="startPractice" :disabled="loading">
          {{ loading ? '准备中...' : '开始练习' }}
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在准备练习内容...</p>
    </div>



    <!-- 闪卡模式 -->
    <div v-if="currentStep === 'flashcard' && practiceWords.length > 0" class="flashcard-mode">
      <!-- 通用进度条 -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <span>{{ currentIndex + 1 }} / {{ practiceWords.length }}</span>
      </div>
      <div class="flashcard-container">
        <div class="flashcard" :class="{ flipped: isFlipped }" @click="flipCard">
          <div class="card-front">
            <h3>{{ currentWord.word }}</h3>
            <p v-if="currentWord.phonetic">{{ currentWord.phonetic }}</p>
          </div>
          <div class="card-back">
            <h4>释义</h4>
            <p class="definition">{{ currentWord.meaning }}</p>
            <div v-if="currentWord.phonetic" class="phonetic">
              <span>{{ currentWord.phonetic }}</span>
            </div>
            <p v-if="currentWord.example" class="example">{{ currentWord.example }}</p>
          </div>
        </div>
      </div>

      <div class="flashcard-actions">
        <button class="audio-btn" @click="playSound(currentWord.word)">
          <i class="fas fa-volume-up"></i>
          发音
        </button>
        <button class="flip-hint-btn" @click="flipCard">
          {{ isFlipped ? '查看单词' : '查看释义' }}
        </button>
      </div>

      <div class="navigation-buttons">
        <button 
          class="nav-btn" 
          @click="prevWord"
          :disabled="currentIndex === 0"
        >
          上一个
        </button>
        <button 
          class="nav-btn" 
          @click="nextWord"
          :disabled="currentIndex === practiceWords.length - 1"
        >
          {{ currentIndex === practiceWords.length - 1 ? '完成练习' : '下一个' }}
        </button>
      </div>
    </div>

    <!-- 测验模式 -->
    <div v-else-if="currentStep === 'quiz' && practiceWords.length > 0" class="quiz-mode">
      <!-- 通用进度条 -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <span>{{ currentIndex + 1 }} / {{ practiceWords.length }}</span>
      </div>

      <div class="quiz-question">
        <h3>请选择单词 "{{ currentWord.word }}" 的正确释义</h3>
      </div>

      <div class="quiz-options">
        <div 
          v-for="(option, index) in quizOptions" 
          :key="index"
          class="quiz-option"
          :class="{ 
            selected: selectedOption === index,
            // 选择的答案是否正确
            correct: showResult && selectedOption === index && isCorrect,
            // 选择的答案是否错误
            incorrect: showResult && selectedOption === index && !isCorrect,
            // 同时显示正确的答案（无论是否选择）
            'correct-answer': showResult && 
                             String(option).replace(/\s+/g, '').toLowerCase() === 
                             String(currentWord.meaning).replace(/\s+/g, '').toLowerCase()
          }"
          @click="selectOption(index)"
        >
          <span>{{ option }}</span>
        </div>
      </div>

      <div v-if="showResult" class="quiz-result">
        <div v-if="isCorrect" class="correct-result">
          <p>✓ 正确！</p>
        </div>
        <div v-else class="wrong-result">
          <p>✗ 错误</p>
          <p>正确答案: {{ currentWord.meaning }}</p>
        </div>
      </div>

      <div class="quiz-actions">
        <button 
          v-if="!showResult" 
          class="submit-btn" 
          @click="submitQuiz"
          :disabled="selectedOption === -1"
        >
          提交
        </button>
        <button 
          v-else 
          class="next-btn" 
          @click="nextQuiz"
        >
          {{ currentIndex === practiceWords.length - 1 ? '查看结果' : '下一题' }}
        </button>
      </div>
    </div>

    <!-- 听力模式 -->
    <div v-else-if="currentStep === 'listening' && practiceWords.length > 0" class="listening-mode">
      <!-- 通用进度条 -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <span>{{ currentIndex + 1 }} / {{ practiceWords.length }}</span>
      </div>

      <div class="listening-content">
        <button class="play-audio-btn" @click="playSound(currentWord.word)">
          <i class="fas fa-volume-up"></i>
          播放发音
        </button>
        
        <p class="listen-hint">请选择听到的单词</p>
        
        <div class="options">
          <button 
            v-for="(option, index) in listeningOptions" 
            :key="index"
            class="option-btn"
            :class="{ 
              'selected': selectedOption === index,
              'correct': showResult && index === correctOptionIndex,
              'incorrect': showResult && selectedOption === index && selectedOption !== correctOptionIndex
            }"
            @click="selectOption(index)"
          >
            {{ option }}
          </button>
        </div>
        
        <div class="listening-actions">
          <button 
            v-if="!showResult" 
            class="submit-btn" 
            @click="submitQuiz"
            :disabled="selectedOption === -1"
          >
            提交
          </button>
          <button 
            v-else 
            class="next-quiz-btn" 
            @click="nextQuiz"
          >
            {{ currentIndex === practiceWords.length - 1 ? '查看结果' : '下一题' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 练习结果 -->
    <div v-else-if="currentStep === 'result'" class="practice-result">
      <div class="result-card">
        <div class="result-header">
          <h3>练习完成！</h3>
        </div>
        
        <div class="result-stats">
          <div class="stat-item">
            <span class="stat-number">{{ results.correct }}</span>
            <span class="stat-label">正确</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ results.total }}</span>
            <span class="stat-label">总题数</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ results.score }}%</span>
            <span class="stat-label">正确率</span>
          </div>
        </div>
        
        <div class="result-actions">
          <button class="result-btn" @click="() => { restartPractice(); refreshPage(); }">
            <i class="fas fa-redo"></i>
            重新练习
          </button>
          <button class="result-btn" @click="() => { backToModeSelection(); refreshPage(); }">
            <i class="fas fa-home"></i>
            返回首页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 音频工具类
class AudioHelper {
  constructor() {
    this.isInitialized = false
    this.audioContext = null
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    this.isWeChat = /MicroMessenger/i.test(navigator.userAgent)
    this.isSpeaking = false
  }

  async init() {
    if (this.isInitialized) return true

    try {
      if (!('speechSynthesis' in window)) {
        console.warn('浏览器不支持语音合成')
        return false
      }

      if (this.isMobile) {
        await this.initMobileAudio()
      }

      await this.waitForVoices()
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('音频初始化失败:', error)
      return false
    }
  }

  async initMobileAudio() {
    if (this.isWeChat) {
      await this.activateWeChatAudio()
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (AudioContext) {
        this.audioContext = new AudioContext()
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume()
        }
      }
    } catch (error) {
      console.warn('音频上下文创建失败:', error)
    }
  }

  async activateWeChatAudio() {
    return new Promise((resolve) => {
      try {
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

  async waitForVoices() {
    return new Promise((resolve) => {
      const checkVoices = () => {
        if (window.speechSynthesis.getVoices().length > 0) {
          resolve()
        } else {
          setTimeout(checkVoices, 100)
        }
      }

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = checkVoices
      }
      checkVoices()
    })
  }

  async speak(text, options = {}) {
    if (!this.isInitialized) {
      await this.init()
    }

    if (!('speechSynthesis' in window)) {
      throw new Error('浏览器不支持语音合成')
    }

    this.stop()

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text)
        
        utterance.lang = options.lang || 'en-US'
        utterance.rate = options.rate || 0.8
        utterance.pitch = options.pitch || 1.0
        utterance.volume = options.volume || 1.0

        if (this.isMobile) {
          utterance.rate = Math.max(0.6, utterance.rate - 0.1)
        }

        utterance.onend = () => {
          this.isSpeaking = false
          resolve()
        }

        utterance.onerror = (event) => {
          this.isSpeaking = false
          reject(new Error(`语音合成错误: ${event.error}`))
        }

        utterance.onstart = () => {
          this.isSpeaking = true
        }

        if (this.isMobile) {
          setTimeout(() => {
            window.speechSynthesis.speak(utterance)
          }, 100)
        } else {
          window.speechSynthesis.speak(utterance)
        }

      } catch (error) {
        this.isSpeaking = false
        reject(error)
      }
    })
  }

  stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      this.isSpeaking = false
    }
  }

  getIsSpeaking() {
    return this.isSpeaking
  }

  async handleUserInteraction() {
    if (!this.isMobile) return true

    return new Promise((resolve) => {
      const activateAudio = async () => {
        try {
          if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume()
          }
          await this.activateWeChatAudio()
          document.removeEventListener('touchstart', activateAudio)
          document.removeEventListener('click', activateAudio)
          resolve(true)
        } catch (error) {
          console.warn('用户交互激活失败:', error)
          resolve(true)
        }
      }

      document.addEventListener('touchstart', activateAudio, { once: true })
      document.addEventListener('click', activateAudio, { once: true })
      
      setTimeout(() => {
        document.removeEventListener('touchstart', activateAudio)
        document.removeEventListener('click', activateAudio)
        resolve(true)
      }, 2000)
    })
  }
}

// 创建音频助手实例
const audioHelper = new AudioHelper()

export default {
  name: 'PracticeWords',
  setup() {
    // 练习状态 - 确保初始状态为模式选择
    const currentStep = ref('mode-selection') // mode-selection, settings, flashcard, quiz, listening, result
    const currentMode = ref('')
    const currentIndex = ref(0)
    const practiceWords = ref([])
    const loading = ref(false)
    
    // 发音状态管理
    const isPronouncing = ref(false)
    
    // 确保页面加载时重置到初始状态
    onMounted(async () => {
      currentStep.value = 'mode-selection'
      currentMode.value = ''
      currentIndex.value = 0
      practiceWords.value = []
      loading.value = false
      
      // 初始化音频助手
      await audioHelper.init()
    })
    
    // 闪卡模式相关
    const isFlipped = ref(false)
    
    // 测验模式相关
    const quizOptions = ref([])
    const listeningOptions = ref([])
    const selectedOption = ref(-1)
    const showResult = ref(false)
    const correctOptionIndex = ref(-1)
    
    // 练习设置
    const settings = ref({
      wordCount: 10,
      difficulty: '全部',
      wordRange: 'all' // 默认显示所有单词，而不是仅今天的
    })
    
    // 练习结果
    const results = ref({
      correct: 0,
      total: 0,
      score: 0
    })
    
    // 当前单词
    const currentWord = computed(() => {
      return practiceWords.value[currentIndex.value] || { word: '', meaning: '', phonetic: '', example: '' }
    })
    
    // 进度百分比
    const progressPercentage = computed(() => {
      if (practiceWords.value.length === 0) return 0
      return ((currentIndex.value + 1) / practiceWords.value.length) * 100
    })
    
    // 选择练习模式
    const selectMode = (mode) => {
      currentMode.value = mode
      currentStep.value = 'settings'
    }
    
    // 开始练习
    const startPractice = async () => {
      loading.value = true
      
      try {
        // 加载单词数据
        const savedWords = localStorage.getItem('dailyEnglishWords')
        let allWords = savedWords ? JSON.parse(savedWords) : []
        
        // 根据选择的范围过滤单词
        if (settings.value.wordRange === 'today') {
          const today = new Date()
          const todayDateStr = today.toISOString().split('T')[0]
          allWords = allWords.filter(word => {
            // 直接比较日期字符串，避免日期转换问题
            return word.date === todayDateStr
          })
        }
        
        // 根据难度级别过滤单词
        if (settings.value.difficulty && settings.value.difficulty !== '全部') {
          allWords = allWords.filter(word => {
            // 如果单词没有难度属性或者难度为空，则根据复习次数估算难度
            const wordDifficulty = word.difficulty || estimateDifficulty(word)
            return matchDifficultyLevel(wordDifficulty, settings.value.difficulty)
          })
        }
        
        // 如果没有单词数据，显示提示
        if (allWords.length === 0) {
          ElMessage.warning('没有找到匹配条件的单词数据，请先添加单词')
          loading.value = false
          return
        }
        
        // 随机选择单词
        const shuffled = [...allWords].sort(() => 0.5 - Math.random())
        practiceWords.value = shuffled.slice(0, Math.min(settings.value.wordCount, allWords.length))
        
        // 初始化结果
        results.value = {
          correct: 0,
          total: practiceWords.value.length,
          score: 0
        }
        
        // 重置索引
        currentIndex.value = 0
        isFlipped.value = false
        selectedOption.value = -1
        showResult.value = false
        
        // 准备特定模式的数据
        if (currentMode.value === 'quiz' || currentMode.value === 'listening') {
          prepareOptions()
        }
        
        // 进入练习模式
        currentStep.value = currentMode.value
        
      } catch (error) {
        console.error('开始练习失败:', error)
        ElMessage.error('准备练习内容失败')
      } finally {
        loading.value = false
      }
    }
    
    // 估算单词难度
    const estimateDifficulty = (word) => {
      // 根据复习次数和是否掌握来估算难度
      const reviewCount = word.reviewCount || 0
      if (word.mastered) return '简单'
      if (reviewCount >= 3) return '简单'
      if (reviewCount >= 1) return '中等'
      return '困难'
    }
    
    // 匹配难度级别
    const matchDifficultyLevel = (wordDifficulty, selectedDifficulty) => {
      // 如果选择的是简单，可以包含简单难度
      if (selectedDifficulty === '简单') return wordDifficulty === '简单'
      // 如果选择的是中等，可以包含简单和中等难度
      if (selectedDifficulty === '中等') return ['简单', '中等'].includes(wordDifficulty)
      // 如果选择的是困难，可以包含所有难度
      if (selectedDifficulty === '困难') return true
      return true
    }
    
    // 刷新页面（重置所有状态）
    const refreshPage = () => {
      // 重置所有状态
      currentStep.value = 'mode-selection'
      currentMode.value = ''
      currentIndex.value = 0
      practiceWords.value = []
      loading.value = false
      isFlipped.value = false
      selectedOption.value = -1
      showResult.value = false
      correctOptionIndex.value = -1
      
      // 重置设置
      settings.value = {
        wordCount: 10,
        difficulty: '全部',
        wordRange: 'today'
      }
      
      // 重置结果
      results.value = {
        correct: 0,
        total: 0,
        score: 0
      }
    }
    
    // 准备测验选项
    const prepareOptions = () => {
      try {
        const savedWords = localStorage.getItem('dailyEnglishWords')
        let allWords = []
        
        // 安全地解析localStorage数据
        try {
          allWords = savedWords ? JSON.parse(savedWords) : []
          if (!Array.isArray(allWords)) {
            console.warn('localStorage中的数据不是数组，已重置为空数组')
            allWords = []
          }
        } catch (e) {
          console.error('解析localStorage数据失败:', e)
          allWords = []
        }
        
        // 获取当前单词
        const word = currentWord.value
        if (!word || !word.word) {
          console.warn('当前没有可用的单词数据')
          return
        }
        
        if (currentMode.value === 'quiz') {
          // 测验模式：选项是单词的释义
          const options = []
          
          // 确保添加正确答案到选项中
          if (word.meaning) {
            options.push(String(word.meaning))
          }
          
          // 过滤出其他单词作为干扰项
          const otherWords = allWords.filter(w => 
            w && 
            w.id !== word.id && 
            w.meaning && 
            String(w.meaning) !== String(word.meaning)
          )
          
          // 随机排序
          const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random())
          
          // 添加干扰项，确保有3个干扰项
          for (let i = 0; i < Math.min(3, shuffledOthers.length); i++) {
            options.push(String(shuffledOthers[i].meaning))
          }
          
          // 如果干扰项不足，创建一些模拟选项
          while (options.length < 4) {
            options.push(`模拟选项 ${options.length + 1}`)
          }
          
          // 打乱选项顺序并保存
          quizOptions.value = options.sort(() => 0.5 - Math.random())
        } else if (currentMode.value === 'listening') {
          // 听力模式：选项是单词
          const options = []
          
          // 确保添加正确答案到选项中
          if (word.word) {
            options.push(String(word.word))
          }
          
          // 过滤出其他单词作为干扰项
          const otherWords = allWords.filter(w => 
            w && 
            w.id !== word.id && 
            w.word && 
            String(w.word) !== String(word.word)
          )
          
          // 随机排序
          const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random())
          
          // 添加干扰项，确保有3个干扰项
          for (let i = 0; i < Math.min(3, shuffledOthers.length); i++) {
            options.push(String(shuffledOthers[i].word))
          }
          
          // 如果干扰项不足，创建一些模拟选项
          while (options.length < 4) {
            options.push(`word${options.length + 1}`)
          }
          
          // 打乱选项顺序并保存
          listeningOptions.value = options.sort(() => 0.5 - Math.random())
          
          // 安全地计算正确选项的索引
          const correctWord = String(word.word)
          correctOptionIndex.value = listeningOptions.value.findIndex(opt => String(opt) === correctWord)
        }
      } catch (error) {
        console.error('准备选项时出错:', error)
        // 出错时提供默认选项，确保用户体验不会中断
        if (currentMode.value === 'quiz') {
          const word = currentWord.value
          // 确保包含正确答案
          const defaultOptions = word?.meaning ? [word.meaning, '选项2', '选项3', '选项4'] : ['选项1', '选项2', '选项3', '选项4']
          quizOptions.value = defaultOptions.sort(() => 0.5 - Math.random())
        } else if (currentMode.value === 'listening') {
          const word = currentWord.value
          // 确保包含正确答案
          const defaultOptions = word?.word ? [word.word, '单词2', '单词3', '单词4'] : ['单词1', '单词2', '单词3', '单词4']
          listeningOptions.value = defaultOptions.sort(() => 0.5 - Math.random())
          // 找出正确选项索引
          correctOptionIndex.value = listeningOptions.value.findIndex(opt => opt === word?.word)
        }
      }
    }
    
    // 播放发音 - 优化移动端兼容性
    const playSound = async (word) => {
      try {
        if (isPronouncing.value) {
          audioHelper.stop()
          isPronouncing.value = false
          return
        }

        // 检查是否需要用户交互激活
        if (audioHelper.isMobile) {
          await audioHelper.handleUserInteraction()
        }

        // 开始发音
        isPronouncing.value = true
        await audioHelper.speak(word)
        
      } catch (error) {
        console.error('发音失败:', error)
        ElMessage.warning('发音播放失败，请重试')
      } finally {
        // 重置状态
        setTimeout(() => {
          isPronouncing.value = false
        }, 1000)
      }
    }

    // 激活音频上下文（解决微信浏览器音频限制）
    const activateAudioContext = () => {
      return new Promise((resolve) => {
        try {
          // 创建音频上下文
          const AudioContext = window.AudioContext || window.webkitAudioContext
          if (AudioContext) {
            const audioContext = new AudioContext()
            
            // 创建静音音频
            const silentAudio = audioContext.createBuffer(1, 1, 22050)
            const source = audioContext.createBufferSource()
            source.buffer = silentAudio
            source.connect(audioContext.destination)
            source.start(0)
            
            // 立即停止
            setTimeout(() => {
              audioContext.close()
              resolve()
            }, 100)
          } else {
            resolve()
          }
        } catch (error) {
          console.warn('激活音频上下文失败:', error)
          resolve()
        }
      })
    }
    
    // 闪卡模式：翻转卡片
    const flipCard = () => {
      isFlipped.value = !isFlipped.value
    }
    
    // 闪卡模式：上一个单词
    const prevWord = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--
        isFlipped.value = false
      }
    }
    
    // 闪卡模式：下一个单词
    const nextWord = () => {
      if (currentIndex.value < practiceWords.value.length - 1) {
        currentIndex.value++
        isFlipped.value = false
      } else {
        // 完成练习
        calculateResults()
        currentStep.value = 'result'
      }
    }
    
    // 测验模式：选择选项
    const selectOption = (index) => {
      if (!showResult.value) {
        selectedOption.value = index
      }
    }
    
    // 测验模式：提交答案
    const submitQuiz = () => {
      if (selectedOption.value === -1) return
      
      showResult.value = true
      
      // 检查答案是否正确
      if (currentMode.value === 'quiz') {
        // 获取当前单词数据和选项
        const word = currentWord.value
        const options = quizOptions.value
        const selectionIndex = selectedOption.value
        
        // 增强的空值检查
        if (word && typeof word === 'object' && word.meaning && options && Array.isArray(options) && selectionIndex >= 0 && selectionIndex < options.length) {
          // 直接比较原始字符串，添加trim()处理以确保一致性
          const selectedOptionText = String(options[selectionIndex]).trim()
          const correctAnswerText = String(word.meaning).trim()
          
          // 进行精确比较
          if (selectedOptionText === correctAnswerText) {
            results.value.correct++
          } else {
            // 尝试更宽松的比较 - 去除所有空格并转小写
            const normalizeString = (str) => str.replace(/\s+/g, '').toLowerCase()
            const selectedNormalized = normalizeString(selectedOptionText)
            const correctNormalized = normalizeString(correctAnswerText)
            
            // 如果宽松比较正确，增加正确计数
            if (selectedNormalized === correctNormalized) {
              results.value.correct++
            }
          }
        }
      } else if (currentMode.value === 'listening') {
        if (selectedOption.value !== undefined && 
            correctOptionIndex.value !== undefined &&
            selectedOption.value === correctOptionIndex.value) {
          results.value.correct++
        }
      }
    }
    
    // 测验模式：下一题
    const nextQuiz = () => {
      if (currentIndex.value < practiceWords.value.length - 1) {
        currentIndex.value++
        selectedOption.value = -1
        showResult.value = false
        
        // 准备下一题的选项
        prepareOptions()
      } else {
        // 完成练习
        calculateResults()
        currentStep.value = 'result'
      }
    }
    
    // 计算结果
    const calculateResults = () => {
      results.value.score = practiceWords.value.length > 0 
        ? Math.round((results.value.correct / results.value.total) * 100) 
        : 0
    }
    
    // 重新练习
    const restartPractice = () => {
      currentStep.value = 'settings'
    }
    
    // 返回模式选择
    const backToModeSelection = () => {
      currentStep.value = 'mode-selection'
      currentMode.value = ''
      currentIndex.value = 0
      practiceWords.value = []
      isFlipped.value = false
      selectedOption.value = -1
      showResult.value = false
    }
    
    // 计算是否正确（用于测验模式）
    const isCorrect = computed(() => {
      if (!showResult.value || selectedOption.value === -1) return false
      
      if (currentMode.value === 'quiz') {
        const word = currentWord.value
        const options = quizOptions.value
        const selectionIndex = selectedOption.value
        
        if (word && typeof word === 'object' && word.meaning && options && Array.isArray(options) && selectionIndex >= 0 && selectionIndex < options.length) {
          // 规范化比较函数
          const normalizeString = (str) => str.replace(/\s+/g, '').toLowerCase()
          
          // 获取选择的选项和正确答案
          const selectedOptionText = String(options[selectionIndex]).trim()
          const correctAnswerText = String(word.meaning).trim()
          
          // 先尝试精确匹配
          if (selectedOptionText === correctAnswerText) {
            return true
          }
          
          // 再尝试宽松匹配
          const selectedNormalized = normalizeString(selectedOptionText)
          const correctNormalized = normalizeString(correctAnswerText)
          
          return selectedNormalized === correctNormalized
        }
      } else if (currentMode.value === 'listening') {
        return selectedOption.value !== undefined && 
               correctOptionIndex.value !== undefined && 
               selectedOption.value === correctOptionIndex.value
      }
      
      return false
    })
    
    // 返回上一步
    const goBack = () => {
      if (currentStep.value === 'settings') {
        backToModeSelection();
      } else if (currentStep.value === 'flashcard' || currentStep.value === 'quiz' || currentStep.value === 'listening') {
        currentStep.value = 'settings';
      }
    };

    return {
      currentStep,
      currentMode,
      currentIndex,
      practiceWords,
      loading,
      isFlipped,
      quizOptions,
      listeningOptions,
      selectedOption,
      showResult,
      correctOptionIndex,
      settings,
      results,
      currentWord,
      progressPercentage,
      isCorrect,
      isPronouncing,
      selectMode,
      startPractice,
      playSound,
      flipCard,
      prevWord,
      nextWord,
      selectOption,
      submitQuiz,
      nextQuiz,
      restartPractice,
      backToModeSelection,
      goBack,
      refreshPage
    }
  }
}
</script>

<style scoped>
.practice-words {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background: transparent;
}

/* 背景装饰元素 - 与AddWord组件一致 */
.practice-words::before {
  content: '';
  position: fixed;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.1;
  z-index: -1;
  animation: float 6s ease-in-out infinite;
}

.practice-words::after {
  content: '';
  position: fixed;
  bottom: -30%;
  left: -10%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  opacity: 0.1;
  z-index: -1;
  animation: float 8s ease-in-out infinite reverse;
}

.bg-gradient {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.05;
  z-index: -2;
}

.bg-circle {
  position: fixed;
  border-radius: 50%;
  opacity: 0.1;
  z-index: -1;
}

.bg-circle:nth-child(1) {
  top: 10%;
  left: 5%;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: float 4s ease-in-out infinite;
}

.bg-circle:nth-child(2) {
  top: 60%;
  right: 5%;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  animation: float 5s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.practice-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
}

h2 {
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

/* 额外的视觉优化 */
.mode-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.02),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.mode-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
  pointer-events: none;
}

.mode-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 
    0 20px 40px rgba(102, 126, 234, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border-color: rgba(102, 126, 234, 0.3);
}

.flashcard-mode-card:hover {
  box-shadow: 
    0 20px 40px rgba(102, 126, 234, 0.2),
    0 8px 16px rgba(102, 126, 234, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border-color: rgba(102, 126, 234, 0.4);
}

.quiz-mode-card:hover {
  box-shadow: 
    0 20px 40px rgba(244, 67, 54, 0.2),
    0 8px 16px rgba(244, 67, 54, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border-color: rgba(244, 67, 54, 0.4);
}

.listening-mode-card:hover {
  box-shadow: 
    0 20px 40px rgba(76, 175, 80, 0.2),
    0 8px 16px rgba(76, 175, 80, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border-color: rgba(76, 175, 80, 0.4);
}

/* 图标容器的增强样式 */
.mode-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.3),
    0 4px 12px rgba(102, 126, 234, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.mode-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.mode-card:hover .mode-icon::before {
  transform: translateX(100%);
}

.quiz-mode-card .mode-icon {
  background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
  box-shadow: 
    0 8px 25px rgba(244, 67, 54, 0.3),
    0 4px 12px rgba(244, 67, 54, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.listening-mode-card .mode-icon {
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
  box-shadow: 
    0 8px 25px rgba(76, 175, 80, 0.3),
    0 4px 12px rgba(76, 175, 80, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* 统计项的增强样式 */
.stat-item {
  text-align: center;
  padding: 20px 28px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(20px);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.02),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  position: relative;
  overflow: hidden;
}

.stat-item::before {
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

.stat-item:hover::before {
  transform: scaleX(1);
}

.stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 8px 30px rgba(102, 126, 234, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border-color: rgba(102, 126, 234, 0.2);
}

/* 特性标签的增强样式 */
.feature-tag {
  padding: 6px 14px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  position: relative;
  overflow: hidden;
}

.feature-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.4s ease;
}

.mode-card:hover .feature-tag::before {
  transform: translateX(100%);
}

.quiz-mode-card .feature-tag {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border-color: rgba(244, 67, 54, 0.2);
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.1);
}

.listening-mode-card .feature-tag {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border-color: rgba(76, 175, 80, 0.2);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.1);
}
.mode-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.mode-intro {
  text-align: center;
  max-width: 600px;
}

.mode-intro h2 {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mode-intro p {
  font-size: 16px;
  color: #6c757d;
  line-height: 1.6;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 900px;
}

.mode-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.mode-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.mode-card:hover::before {
  transform: scaleX(1);
}

.mode-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.2);
}

.flashcard-mode-card:hover {
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
}

.quiz-mode-card:hover {
  box-shadow: 0 12px 40px rgba(244, 67, 54, 0.2);
}

.listening-mode-card:hover {
  box-shadow: 0 12px 40px rgba(76, 175, 80, 0.2);
}

.mode-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.quiz-mode-card .mode-icon {
  background: linear-gradient(135deg, #f44336 0%, #e91e63 100%);
  box-shadow: 0 8px 25px rgba(244, 67, 54, 0.3);
}

.listening-mode-card .mode-icon {
  background: linear-gradient(135deg, #4caf50 0%, #8bc34a 100%);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
}

.mode-card:hover .mode-icon {
  transform: scale(1.1) rotate(5deg);
}

.mode-icon i {
  font-size: 36px;
  color: white;
}

.mode-content {
  margin-bottom: 20px;
}

.mode-content h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.mode-content p {
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
}

.mode-features {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-tag {
  padding: 4px 12px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.quiz-mode-card .feature-tag {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border-color: rgba(244, 67, 54, 0.2);
}

.listening-mode-card .feature-tag {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border-color: rgba(76, 175, 80, 0.2);
}

/* 练习统计 */
.practice-stats {
  display: flex;
  gap: 48px;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.1);
}

.stat-number {
  font-size: 24px;
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

/* 设置样式 - 使用gradient-card样式 */
.practice-settings {
  background: #fff;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.practice-settings::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.settings-group {
  margin-bottom: 20px;
}

.settings-group label {
  display: block;
  margin-bottom: 10px;
  color: #333;
  font-weight: 500;
}

.settings-group input[type="number"],
.settings-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fff;
}

.settings-group input[type="number"]:focus,
.settings-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.radio-group {
  display: flex;
  gap: 20px;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.settings-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
}

.back-btn,
.start-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.back-btn {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e9ecef;
}

.back-btn:hover {
  background: #e9ecef;
  color: #495057;
  transform: translateY(-1px);
}

.start-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.start-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  box-shadow: none;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 进度条 */
.progress-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 15px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

/* 闪卡模式 */
.flashcard-mode {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.flashcard-container {
  perspective: 1000px;
  width: 100%;
  max-width: 500px;
}

.flashcard {
  width: 100%;
  height: 250px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
  cursor: pointer;
}

.flashcard.flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.card-back {
  transform: rotateY(180deg);
}

.card-front h3 {
  font-size: 36px;
  color: #333;
  margin-bottom: 10px;
}

.card-front p {
  color: #666;
  font-size: 18px;
}

.card-back h4 {
  color: #667eea;
  margin-bottom: 15px;
  font-size: 20px;
}

.card-back .definition {
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
}

.card-back .phonetic {
  margin-bottom: 15px;
  color: #666;
}

.card-back .example {
  font-style: italic;
  color: #666;
  text-align: center;
}

.flashcard-actions {
  display: flex;
  gap: 20px;
}

.audio-btn,
.flip-hint-btn {
  padding: 10px 20px;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.audio-btn:hover,
.flip-hint-btn:hover {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
}

.navigation-buttons {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.nav-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.nav-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  box-shadow: none;
}

/* 测验模式 - 使用gradient-card样式 */
.quiz-mode {
  background: #fff;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.quiz-mode::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.quiz-question {
  margin-bottom: 30px;
  text-align: center;
}

.quiz-question h3 {
  color: #333;
  font-size: 20px;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.quiz-option {
  padding: 15px 20px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fff;
}

.quiz-option:hover {
  background: #f8f9fa;
  border-color: #667eea;
}

.quiz-option.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.quiz-option.correct {
  border-color: #34a853;
  background: rgba(52, 168, 83, 0.1);
  font-weight: bold;
}

.quiz-option.incorrect {
  border-color: #ea4335;
  background: rgba(234, 67, 53, 0.1);
}

.quiz-option.correct-answer {
  border-color: #34a853;
  background: rgba(52, 168, 83, 0.1);
}

.quiz-option.correct.correct-answer {
  border-color: #34a853;
  background: rgba(52, 168, 83, 0.1);
  font-weight: bold;
}

.quiz-result {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.correct-result {
  background: rgba(52, 168, 83, 0.1);
  color: #34a853;
}

.wrong-result {
  background: rgba(234, 67, 53, 0.1);
  color: #ea4335;
}

.quiz-actions {
  display: flex;
  justify-content: center;
}

.submit-btn,
.next-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  box-shadow: none;
}

.next-btn {
  background: linear-gradient(135deg, #34a853 0%, #2d8d48 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(52, 168, 83, 0.3);
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 168, 83, 0.4);
}

/* 听力模式 - 使用gradient-card样式 */
.listening-mode {
  background: #fff;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.listening-mode::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.listening-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

.play-audio-btn {
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  -webkit-touch-callout: none;
  outline: none;
}

.play-audio-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.play-audio-btn:active {
  transform: translateY(0) scale(0.98);
}

.play-audio-btn.mobile-optimized {
  /* 移动端优化 */
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  outline: none;
}

.play-audio-btn.mobile-optimized:hover {
  transform: none; /* 移动端不使用hover效果 */
}

.play-audio-btn.mobile-optimized:active {
  transform: scale(0.95);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.play-audio-btn.speaking {
  animation: speaking 1.5s ease-in-out infinite;
}

.play-audio-btn.speaking i {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes speaking {
  0%, 100% { 
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  }
  50% { 
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.listen-hint {
  font-size: 18px;
  color: #333;
}

.options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  width: 100%;
}

.option-btn {
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
}

.option-btn:hover {
  background: #f8f9fa;
  border-color: #667eea;
}

.option-btn.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.option-btn.correct {
  border-color: #34a853;
  background: rgba(52, 168, 83, 0.1);
}

.option-btn.incorrect {
  border-color: #ea4335;
  background: rgba(234, 67, 53, 0.1);
}

.next-quiz-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #34a853 0%, #2d8d48 100%);
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(52, 168, 83, 0.3);
}

.next-quiz-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 168, 83, 0.4);
}

/* 练习结果 - 使用gradient-card样式 */
.practice-result {
  display: flex;
  justify-content: center;
  padding: 40px 20px;
}

.result-card {
  background: #fff;
  border-radius: 15px;
  padding: 40px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  text-align: center;
  max-width: 400px;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.result-header h3 {
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
}

.result-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 36px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 10px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.result-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.result-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.result-btn:nth-child(1) {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e9ecef;
}

.result-btn:nth-child(1):hover {
  background: #e9ecef;
  color: #495057;
  transform: translateY(-1px);
}

.result-btn:nth-child(2) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.result-btn:nth-child(2):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* 动画效果 */
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

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
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

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

/* 应用动画 */
.mode-intro {
  animation: fadeInUp 0.6s ease-out;
}

.mode-card {
  animation: fadeInUp 0.8s ease-out backwards;
}

.mode-card:nth-child(1) {
  animation-delay: 0.1s;
}

.mode-card:nth-child(2) {
  animation-delay: 0.2s;
}

.mode-card:nth-child(3) {
  animation-delay: 0.3s;
}

.stat-item {
  animation: fadeInUp 1s ease-out backwards;
}

.stat-item:nth-child(1) {
  animation-delay: 0.4s;
}

.stat-item:nth-child(2) {
  animation-delay: 0.5s;
}

.stat-item:nth-child(3) {
  animation-delay: 0.6s;
}

/* 悬停时的脉冲效果 */
.mode-card:active {
  animation: pulse 0.3s ease-in-out;
}

/* 加载时的闪光效果 */
.mode-card.loading {
  position: relative;
  overflow: hidden;
}

.mode-card.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 2s infinite;
}

/* 模式卡片的特殊效果 */
.flashcard-mode-card {
  background: linear-gradient(135deg, #fff 0%, #f8f9ff 100%);
}

.quiz-mode-card {
  background: linear-gradient(135deg, #fff 0%, #fff5f5 100%);
}

.listening-mode-card {
  background: linear-gradient(135deg, #fff 0%, #f5fff9 100%);
}

/* 图标的旋转动画 */
.mode-card:hover .mode-icon i {
  transform: rotate(10deg);
  transition: transform 0.3s ease;
}

/* 特性标签的动画 */
.feature-tag {
  transition: all 0.3s ease;
}

.mode-card:hover .feature-tag {
  transform: scale(1.05);
}

/* 统计数字的计数动画 */
.stat-number {
  transition: all 0.3s ease;
}

.stat-item:hover .stat-number {
  transform: scale(1.1);
}

/* 页面进入动画 */
.practice-words {
  animation: fadeInUp 0.5s ease-out;
}

/* 背景装饰的增强动画 */
.practice-words::before {
  animation: float 8s ease-in-out infinite, pulse 4s ease-in-out infinite;
}

.practice-words::after {
  animation: float 10s ease-in-out infinite reverse, pulse 6s ease-in-out infinite;
}

.bg-circle:nth-child(1) {
  animation: float 6s ease-in-out infinite, pulse 3s ease-in-out infinite;
}

.bg-circle:nth-child(2) {
  animation: float 7s ease-in-out infinite reverse, pulse 4s ease-in-out infinite;
}
@media (max-width: 768px) {
  .practice-words {
    padding: 15px;
    min-height: 100vh;
  }
  
  .practice-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .back-button {
    align-self: flex-start;
    position: static;
    margin-bottom: 10px;
  }
  
  .practice-header h2 {
    font-size: 1.5rem;
    margin: 0;
    text-align: center;
  }
  
  .mode-selection h2,
  .practice-settings h2 {
    font-size: 1.3rem;
    text-align: center;
  }
  
  .back-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .mode-cards {
    grid-template-columns: 1fr;
    gap: 20px;
    max-width: 100%;
  }
  
  .mode-card {
    padding: 24px 20px;
    min-height: auto;
  }
  
  .mode-card i {
    font-size: 40px;
    margin-bottom: 12px;
  }
  
  .mode-card h3 {
    font-size: 1.2rem;
    margin: 10px 0;
  }
  
  .mode-card p {
    font-size: 13px;
  }
  
  .settings-group {
    margin-bottom: 15px;
  }
  
  .settings-group label {
    font-size: 14px;
    margin-bottom: 8px;
  }
  
  .settings-group input,
  .settings-group select {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .settings-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .back-btn,
  .start-btn {
    width: 100%;
    padding: 12px;
  }
  
  .start-btn {
    font-size: 16px;
  }
  
  .flashcard {
    height: 280px;
    width: 95%;
    margin: 0 auto 20px;
  }
  
  .card-front h3 {
    font-size: 24px;
  }
  
  .card-front p {
    font-size: 16px;
  }
  
  .card-back .definition {
    font-size: 18px;
  }
  
  .card-back .example {
    font-size: 14px;
  }
  
  .progress-container {
    margin: 20px 0;
  }
  
  .progress-bar {
    height: 6px;
  }
  
  .flashcard-actions,
  .navigation-buttons,
  .result-actions {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }
  
  .options {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .option-btn {
    padding: 15px;
    font-size: 15px;
  }
  
  .result-stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .stat-number {
    font-size: 28px;
  }
  
  /* 小屏手机专用优化 */
  .loading-container {
    padding: 40px 20px;
  }
  
  .loading-spinner {
    width: 30px;
    height: 30px;
  }
}

@media (max-width: 480px) {
  .practice-words {
    padding: 12px;
  }
  
  .mode-cards {
    gap: 15px;
  }
  
  .mode-card {
    padding: 20px 16px;
  }
  
  .mode-card i {
    font-size: 36px;
    margin-bottom: 10px;
  }
  
  .mode-card h3 {
    font-size: 1.1rem;
    margin: 8px 0;
  }
  
  .mode-card p {
    font-size: 12px;
  }
}

/* 小屏手机专用优化 (375px以下) */
@media (max-width: 375px) {
  .practice-words {
    padding: 10px;
  }
  
  .practice-header h2 {
    font-size: 1.3rem;
  }
  
  .back-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .mode-card {
    padding: 18px 14px;
  }
  
  .mode-card i {
    font-size: 1.5rem;
  }
  
  .mode-card h3 {
    font-size: 1.1rem;
    margin: 8px 0;
  }
  
  .mode-card p {
    font-size: 13px;
  }
  
  .settings-group label {
    font-size: 14px;
    margin-bottom: 5px;
  }
  
  .settings-group input,
  .settings-group select {
    padding: 6px 10px;
    font-size: 13px;
  }
  
  .radio-group label {
    font-size: 13px;
  }
  
  .flashcard {
    height: 250px;
    width: 98%;
  }
  
  .card-front h3 {
    font-size: 20px;
  }
  
  .card-front p {
    font-size: 14px;
  }
  
  .card-back .definition {
    font-size: 16px;
  }
  
  .card-back p {
    font-size: 13px;
  }
  
  .option-btn {
    padding: 12px;
    font-size: 14px;
  }
  
  .progress-container {
    margin: 15px 0;
    font-size: 14px;
  }
  
  .result-card h3 {
    font-size: 1.3rem;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .stat-label {
    font-size: 13px;
  }
  
  .result-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .play-audio-btn {
    font-size: 16px;
    padding: 12px 24px;
  }
}

/* 极小屏适配 (320px以下) */
@media (max-width: 320px) {
  .practice-words {
    padding: 8px;
  }
  
  .practice-header h2 {
    font-size: 1.2rem;
  }
  
  .back-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .mode-card {
    padding: 16px 12px;
    min-height: 90px;
  }
  
  .mode-card i {
    font-size: 24px;
  }
  
  .mode-card h3 {
    font-size: 1rem;
    margin: 6px 0;
  }
  
  .mode-card p {
    font-size: 11px;
  }
  
  .flashcard {
    height: 220px;
    margin: 10px auto;
  }
  
  .card-front h3 {
    font-size: 18px;
  }
  
  .card-back .definition {
    font-size: 15px;
  }
  
  .option-btn {
    padding: 10px;
    font-size: 13px;
  }
  
  .settings-group input,
  .settings-group select {
    font-size: 13px;
    padding: 8px;
  }
  
  .result-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .play-audio-btn {
    font-size: 14px;
    padding: 10px 20px;
  }
}
</style>