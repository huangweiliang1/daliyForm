<template>
  <div class="search-words-container">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="app-title">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="app-icon">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            每日英语
          </h1>
          <div class="header-stats">
            <div class="stat-item">
              <span class="stat-value">{{ words.length }}</span>
              <span class="stat-label">总单词</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ weeklyNewWords }}</span>
              <span class="stat-label">本周新增</span>
            </div>
          </div>
        </div>
        
        <div class="header-actions">
          <button class="btn btn-primary" @click="showAddWordModal = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            添加单词
          </button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 搜索区域 -->
      <section class="search-section">
        <div class="search-container">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L15.5 15.5M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <input
              v-model="searchForm.keyword"
              placeholder="搜索单词、释义或标签..."
              class="search-input"
              @input="debouncedSearch"
              @keyup.enter="handleSearch"
              @focus="showSearchSuggestions = true"
              @blur="hideSearchSuggestions"
            >
            <button 
              v-if="searchForm.keyword"
              class="clear-btn"
              @click="clearKeyword"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          
          <!-- 搜索建议 -->
          <div v-if="showSearchSuggestions && searchSuggestions.length" class="search-suggestions">
            <div 
              v-for="(suggestion, index) in searchSuggestions" 
              :key="index"
              class="suggestion-item"
              @click="selectSuggestion(suggestion)"
            >
              <span class="suggestion-text">{{ suggestion.word }}</span>
              <span class="suggestion-type">{{ suggestion.type }}</span>
            </div>
          </div>
        </div>

        <!-- 快捷筛选标签 -->
        <div class="quick-filters">
          <button
            v-for="filter in quickFilters"
            :key="filter.key"
            class="filter-chip"
            :class="{ active: searchForm.filter === filter.key }"
            @click="setQuickFilter(filter.key)"
          >
            {{ filter.label }}
          </button>
          <button 
            class="filter-chip filter-toggle"
            :class="{ active: showAdvancedFilters }"
            @click="showAdvancedFilters = !showAdvancedFilters"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            高级筛选
            <span v-if="activeFilterCount > 0" class="filter-count">{{ activeFilterCount }}</span>
          </button>
        </div>
      </section>

      <!-- 高级筛选面板 -->
      <section v-if="showAdvancedFilters" class="advanced-filters">
        <div class="filters-grid">
          <!-- 词性筛选 -->
          <div class="filter-group">
            <h4>词性</h4>
            <div class="filter-options">
              <button
                v-for="pos in partOfSpeechOptions"
                :key="pos.value"
                class="filter-option"
                :class="{ active: advancedFilters.partOfSpeech === pos.value }"
                @click="togglePartOfSpeech(pos.value)"
              >
                {{ pos.label }}
              </button>
            </div>
          </div>

          <!-- 标签筛选 -->
          <div class="filter-group" v-if="popularTags.length > 0">
            <h4>标签</h4>
            <div class="tag-grid">
              <button
                v-for="tag in popularTags.slice(0, 12)"
                :key="tag"
                class="tag-chip"
                :class="{ active: advancedFilters.selectedTags.includes(tag) }"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </div>

          <!-- 日期和排序 -->
          <div class="filter-group">
            <h4>添加时间</h4>
            <el-date-picker
              v-model="advancedFilters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              size="small"
              @change="handleSearch"
            />
          </div>

          <div class="filter-group">
            <h4>排序</h4>
            <div class="sort-options">
              <button
                v-for="option in sortOptions"
                :key="option.value"
                class="sort-option"
                :class="{ active: searchForm.sort === option.value }"
                @click="setSortOption(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="filter-actions">
          <button class="btn btn-secondary" @click="clearAllFilters" v-if="hasActiveFilters">
            清空筛选
          </button>
        </div>
      </section>

      <!-- 搜索结果区域 -->
      <section class="results-section">
        <!-- 结果头部 -->
        <div class="results-header">
          <div class="results-info">
            <h2 v-if="hasSearch" class="results-title">
              搜索结果 <span class="results-count">({{ filteredWords.length }})</span>
            </h2>
            <h2 v-else class="results-title">所有单词</h2>
          </div>
          
          <div class="results-actions">
            <div class="view-switcher">
              <button 
                class="view-btn"
                :class="{ active: viewMode === 'grid' }"
                @click="viewMode = 'grid'"
                title="网格视图"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                  <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                  <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                  <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              <button 
                class="view-btn"
                :class="{ active: viewMode === 'list' }"
                @click="viewMode = 'list'"
                title="列表视图"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2"/>
                  <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
            
            <button 
              class="btn btn-secondary"
              @click="showBatchMode = !showBatchMode"
              :class="{ active: showBatchMode }"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 4h18M3 10h18M3 16h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              批量操作
            </button>
          </div>
        </div>

        <!-- 单词列表 -->
        <div class="words-container">
          <!-- 加载状态 -->
          <div v-if="searching" class="loading-state">
            <div class="loading-cards">
              <div v-for="i in 6" :key="i" class="skeleton-card">
                <div class="skeleton-header">
                  <div class="skeleton-title"></div>
                  <div class="skeleton-actions"></div>
                </div>
                <div class="skeleton-content"></div>
                <div class="skeleton-tags"></div>
              </div>
            </div>
          </div>

          <!-- 空结果状态 -->
          <div v-else-if="hasSearch && filteredWords.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                <path d="M21 21L15.5 15.5M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.3"/>
                <path d="M9 9H11M9 13H11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <h3>未找到匹配的单词</h3>
            <p>尝试调整搜索条件或检查拼写</p>
            <div class="empty-actions">
              <button class="btn btn-primary" @click="clearSearch">重置搜索</button>
              <button class="btn btn-secondary" @click="showAddWordModal = true">添加新单词</button>
            </div>
          </div>

          <!-- 单词卡片网格 -->
          <div v-else-if="hasSearch" class="words-grid" :class="viewMode">
            <div
              v-for="(word, index) in displayWords"
              :key="word.id"
              class="word-card"
              :class="{ 
                'expanded': expandedWords.includes(word.id),
                'selected': isSelectedWord(word.id),
                'batch-selected': selectedWords.includes(word.id)
              }"
              @click="handleWordClick(word, $event)"
            >
              <!-- 批量选择 -->
              <div v-if="showBatchMode" class="batch-checkbox" @click.stop>
                <input 
                  type="checkbox" 
                  :checked="selectedWords.includes(word.id)"
                  @change="toggleWordSelection(word.id)"
                >
              </div>

              <!-- 卡片内容 -->
              <div class="card-content">
                <div class="card-header">
                  <div class="word-info">
                    <h3 class="word-title">{{ word.word }}</h3>
                    <div v-if="word.phonetic" class="word-phonetic">{{ word.phonetic }}</div>
                  </div>
                  
                  <div class="card-actions">
                    <button
                      class="action-btn"
                      @click.stop="pronounceWord(word.word)"
                      title="发音"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 9V15H7L12 20V4L7 9H3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 9.5C16.5 10.5 16.5 11.5 16 12.5M19 6C20.5 8 20.5 12 19 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <button
                      class="action-btn"
                      @click.stop="toggleWordDetail(word.id)"
                      :title="expandedWords.includes(word.id) ? '收起' : '展开'"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M19 9L12 16L5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <button
                      class="action-btn"
                      @click.stop="showWordMenu(word, $event)"
                      title="更多操作"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="5" r="1" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="12" r="1" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="19" r="1" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div class="card-body">
                  <div class="word-meta">
                    <span v-if="word.partOfSpeech" class="part-of-speech">{{ word.partOfSpeech }}</span>
                    <span class="word-date">{{ formatDate(word.date) }}</span>
                  </div>
                  
                  <p class="word-meaning">{{ word.meaning }}</p>
                  
                  <div v-if="word.tags && word.tags.length" class="word-tags">
                    <span 
                      v-for="tag in word.tags.slice(0, 3)" 
                      :key="tag"
                      class="tag"
                    >
                      {{ tag }}
                    </span>
                    <span v-if="word.tags.length > 3" class="more-tags">+{{ word.tags.length - 3 }}</span>
                  </div>
                </div>

                <!-- 展开详情 -->
                <transition name="expand">
                  <div v-if="expandedWords.includes(word.id)" class="card-details">
                    <div v-if="word.example" class="detail-item">
                      <h4>例句</h4>
                      <p>{{ word.example }}</p>
                    </div>
                    
                    <div v-if="word.synonyms" class="detail-item">
                      <h4>同义词/反义词</h4>
                      <p>{{ word.synonyms }}</p>
                    </div>
                    
                    <div class="detail-actions">
                      <button class="btn btn-sm btn-secondary" @click.stop="editWord(word)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        编辑
                      </button>
                      <button class="btn btn-sm btn-danger" @click.stop="confirmDelete(word)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        删除
                      </button>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div v-if="hasSearch && totalPages > 1" class="pagination">
            <div class="pagination-info">
              <span>显示 {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, filteredWords.length) }} 共 {{ filteredWords.length }} 个单词</span>
              <select v-model="pageSize" class="page-size-select">
                <option :value="12">12/页</option>
                <option :value="24">24/页</option>
                <option :value="48">48/页</option>
              </select>
            </div>
            
            <div class="pagination-controls">
              <button
                class="pagination-btn"
                @click="prevPage"
                :disabled="currentPage === 1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              
              <div class="page-numbers">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  class="pagination-btn page-number"
                  :class="{ active: page === currentPage }"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
              </div>
              
              <button
                class="pagination-btn"
                @click="nextPage"
                :disabled="currentPage === totalPages"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 批量操作栏 -->
    <div v-if="showBatchMode && selectedWords.length > 0" class="batch-bar">
      <div class="batch-content">
        <div class="batch-info">
          已选择 <strong>{{ selectedWords.length }}</strong> 个单词
        </div>
        <div class="batch-actions">
          <button class="btn btn-secondary" @click="selectAllWords">全选</button>
          <button class="btn btn-secondary" @click="clearSelection">取消选择</button>
          <button class="btn btn-danger" @click="batchDelete">批量删除</button>
          <button class="btn btn-primary" @click="exportSelected">导出选中</button>
        </div>
      </div>
    </div>

    <!-- 删除确认对话框 -->
    <div v-if="deleteDialogVisible" class="modal-overlay" @click="deleteDialogVisible = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>确认删除</h3>
          <button class="modal-close" @click="deleteDialogVisible = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="modal-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p>确定要删除单词 <strong>{{ currentWordToDelete?.word }}</strong> 吗？</p>
          <p class="warning-text">此操作不可撤销</p>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="deleteDialogVisible = false">取消</button>
          <button class="btn btn-danger" @click="deleteWord" :disabled="deleting">
            {{ deleting ? '删除中...' : '确定删除' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 浮动添加按钮 -->
    <button class="fab" @click="showAddWordModal = true" title="添加新单词">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'SearchWords',
  emits: ['words-updated'],
  setup(props, { emit }) {
    // 基础数据
    const words = ref([])
    const loading = ref(false)
    const searching = ref(false)
    const selectedWordId = ref(null)
    const selectedWords = ref([])
    const expandedWords = ref([])

    // 搜索相关状态
const searchForm = reactive({
  keyword: '',
  filter: 'all',
  sort: 'default'
})

const advancedFilters = reactive({
  partOfSpeech: '',
  dateRange: [],
  selectedTags: []
})

const showSidebar = ref(true)
// 分页相关
const currentPage = ref(1)
const pageSize = ref(24)

// 删除相关
const deleteDialogVisible = ref(false)
const currentWordToDelete = ref(null)
const deleting = ref(false)

// 视图和模式相关
const viewMode = ref('grid') // 'grid' | 'list'
const showBatchMode = ref(false)
const showAddWordModal = ref(false)
const showWordMenu = ref(false)
const currentWordMenu = ref(null)
const menuPosition = ref({ x: 0, y: 0 })

// 搜索建议相关
const showSearchSuggestions = ref(false)
const searchSuggestions = ref([])

// 高级筛选相关
const showAdvancedFilters = ref(false)

    // 搜索选项
    const searchOptions = [
      { label: '全部', value: 'all' },
      { label: '单词', value: 'word' },
      { label: '释义', value: 'meaning' },
      { label: '标签', value: 'tag' }
    ]

    // 词性选项
    const partOfSpeechOptions = [
      { label: '名词', value: 'n.' },
      { label: '动词', value: 'v.' },
      { label: '形容词', value: 'adj.' },
      { label: '副词', value: 'adv.' },
      { label: '介词', value: 'prep.' },
      { label: '连词', value: 'conj.' },
      { label: '代词', value: 'pron.' },
      { label: '数词', value: 'num.' },
      { label: '感叹词', value: 'interj.' }
    ]

    // 排序选项
    const sortOptions = [
      { label: '默认', value: 'default' },
      { label: '按添加日期', value: 'date' },
      { label: '按字母顺序', value: 'alphabet' }
    ]

    // 快捷筛选
    const quickFilters = [
      { key: 'all', label: '全部' },
      { key: 'word', label: '仅单词' },
      { key: 'meaning', label: '仅释义' },
      { key: 'tag', label: '仅标签' }
    ]

    // 防抖搜索
    let searchTimeout = null
    const debouncedSearch = () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        generateSearchSuggestions(searchForm.keyword)
        handleSearch()
      }, 300)
    }
    
    // 计算属性
    const hasSearch = computed(() => searchForm.keyword.trim() !== '')
    
    const filteredWords = computed(() => {
      let result = [...words.value]
      
      // 关键词搜索
      if (hasSearch.value) {
        const keyword = searchForm.keyword.toLowerCase()
        result = result.filter(word => 
          word.word.toLowerCase().includes(keyword) ||
          word.meaning.toLowerCase().includes(keyword) ||
          (word.tags && word.tags.some(tag => tag.toLowerCase().includes(keyword)))
        )
      }
      
      // 快速筛选
      if (searchForm.filter === 'recent') {
        result = result.slice(0, 20)
      } else if (searchForm.filter === 'favorites') {
        result = result.filter(word => word.isFavorite)
      } else if (searchForm.filter === 'difficult') {
        result = result.filter(word => word.difficulty >= 3)
      }
      
      // 高级筛选 - 词性
      if (advancedFilters.partOfSpeech) {
        result = result.filter(word => word.partOfSpeech === advancedFilters.partOfSpeech)
      }
      
      // 高级筛选 - 标签
      if (advancedFilters.selectedTags.length > 0) {
        result = result.filter(word => 
          advancedFilters.selectedTags.some(tag => word.tags.includes(tag))
        )
      }
      
      // 高级筛选 - 日期范围
      if (advancedFilters.dateRange && advancedFilters.dateRange.length === 2) {
        const [startDate, endDate] = advancedFilters.dateRange
        result = result.filter(word => {
          const wordDate = word.date.split(' ')[0]
          return wordDate >= startDate && wordDate <= endDate
        })
      }
      
      // 排序
      result.sort((a, b) => {
        switch (searchForm.sort) {
          case 'date':
            return new Date(b.date) - new Date(a.date)
          case 'word':
            return a.word.localeCompare(b.word)
          case 'difficulty':
            return (b.difficulty || 0) - (a.difficulty || 0)
          default:
            return 0
        }
      })
      
      return result
    })
    
    const displayWords = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return filteredWords.value.slice(start, end)
    })
    
    // 计算热门标签
    const popularTags = computed(() => {
      const tagCounts = {}
      words.value.forEach(word => {
        if (word.tags && word.tags.length) {
          word.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        }
      })
      
      // 排序并返回前10个最常用的标签
      return Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag)
    })

    // 计算总页数
    const totalPages = computed(() => {
      return Math.ceil(filteredWords.value.length / pageSize.value)
    })

    // 计算可见页码
    const visiblePages = computed(() => {
      const total = totalPages.value
      const current = currentPage.value
      const delta = 2
      
      const range = []
      const rangeWithDots = []
      
      for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
        range.push(i)
      }
      
      if (current - delta > 2) {
        rangeWithDots.push(1, '...')
      } else {
        rangeWithDots.push(1)
      }
      
      rangeWithDots.push(...range)
      
      if (current + delta < total - 1) {
        rangeWithDots.push('...', total)
      } else {
        rangeWithDots.push(total)
      }
      
      return rangeWithDots.filter(page => page !== '...' || rangeWithDots.length > 1)
    })

    // 计算活跃筛选数量
    const activeFilterCount = computed(() => {
      let count = 0
      if (searchForm.filter !== 'all') count++
      if (advancedFilters.partOfSpeech) count++
      if (advancedFilters.dateRange && advancedFilters.dateRange.length === 2) count++
      if (advancedFilters.selectedTags.length > 0) count++
      return count
    })

    // 是否有活跃筛选
    const hasActiveFilters = computed(() => {
      return activeFilterCount.value > 0
    })

    // 统计数据
    const weeklyNewWords = computed(() => {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return words.value.filter(word => new Date(word.date) >= oneWeekAgo).length
    })

    const masteredWords = computed(() => {
      // 假设有掌握状态标记，这里简化处理
      return Math.floor(words.value.length * 0.3) // 模拟30%已掌握
    })
    
    // 加载单词数据
    const loadWords = () => {
      const savedWords = localStorage.getItem('dailyEnglishWords')
      words.value = savedWords ? JSON.parse(savedWords) : []
    }

    // 清空搜索
    const clearSearch = () => {
      searchForm.keyword = ''
      searchForm.filter = 'all'
      searchForm.sort = 'default'
      advancedFilters.partOfSpeech = ''
      advancedFilters.dateRange = []
      advancedFilters.selectedTags = []
      handleSearch()
    }

    // 清空关键词
    const clearKeyword = () => {
      searchForm.keyword = ''
      handleSearch()
    }

    // 设置快捷筛选
    const setQuickFilter = (filterKey) => {
      searchForm.filter = filterKey
      handleSearch()
    }

    // 设置排序选项
    const setSortOption = (sortValue) => {
      searchForm.sort = sortValue
      handleSearch()
    }

    // 切换词性筛选
    const togglePartOfSpeech = (pos) => {
      advancedFilters.partOfSpeech = advancedFilters.partOfSpeech === pos ? '' : pos
      handleSearch()
    }

    // 切换标签筛选
    const toggleTag = (tag) => {
      const index = advancedFilters.selectedTags.indexOf(tag)
      if (index > -1) {
        advancedFilters.selectedTags.splice(index, 1)
      } else {
        advancedFilters.selectedTags.push(tag)
      }
      handleSearch()
    }

    // 清空所有筛选
    const clearAllFilters = () => {
      searchForm.filter = 'all'
      advancedFilters.partOfSpeech = ''
      advancedFilters.dateRange = []
      advancedFilters.selectedTags = []
      handleSearch()
    }
    
    // 处理搜索
    const handleSearch = async () => {
      searching.value = true
      
      // 模拟异步搜索
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // filteredWords是计算属性，会自动重新计算，不需要手动赋值
      hasSearch.value = true
      currentPage.value = 1 // 重置到第一页
      searching.value = false
    }
    
    // 切换高级筛选面板
    const toggleAdvancedFilters = () => {
      showAdvancedFilters.value = !showAdvancedFilters.value
    }

    // 处理单词点击
    const handleWordClick = (word, event) => {
      if (showBatchMode.value) {
        toggleWordSelection(word.id)
      } else {
        selectWord(word.id)
      }
    }

    // 选择单词
    const selectWord = (wordId) => {
      selectedWordId.value = selectedWordId.value === wordId ? null : wordId
    }

    // 判断单词是否被选中
    const isSelectedWord = (wordId) => {
      return selectedWordId.value === wordId
    }

    // 切换单词选择
    const toggleWordSelection = (wordId) => {
      const index = selectedWords.value.indexOf(wordId)
      if (index > -1) {
        selectedWords.value.splice(index, 1)
      } else {
        selectedWords.value.push(wordId)
      }
    }

    // 全选单词
    const selectAllWords = () => {
      selectedWords.value = [...displayWords.value.map(word => word.id)]
    }

    // 清空选择
    const clearSelection = () => {
      selectedWords.value = []
    }

    // 切换批量模式
    const toggleBatchMode = () => {
      showBatchMode.value = !showBatchMode.value
      if (!showBatchMode.value) {
        clearSelection()
      }
    }



    // 导出选中的单词
    const exportSelected = () => {
      if (selectedWords.value.length === 0) return
      
      const selectedData = words.value.filter(word => selectedWords.value.includes(word.id))
      const exportData = JSON.stringify(selectedData, null, 2)
      
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `words_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      ElMessage.success('导出成功')
    }

    // 显示单词菜单
    const showWordMenuFunc = (word, event) => {
      currentWordMenu.value = word
      menuPosition.value = { x: event.clientX, y: event.clientY }
      showWordMenu.value = true
    }

    // 隐藏单词菜单
    const hideWordMenu = () => {
      showWordMenu.value = false
      currentWordMenu.value = null
    }

    // 编辑单词
    const editWord = (word) => {
      console.log('编辑单词:', word)
      ElMessage.info('编辑功能开发中...')
    }

    // 切换单词详情
    const toggleWordDetail = (wordId) => {
      const index = expandedWords.value.indexOf(wordId)
      if (index > -1) {
        expandedWords.value.splice(index, 1)
      } else {
        expandedWords.value.push(wordId)
      }
    }

    // 发音功能
    const pronounceWord = (word) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = 'en-US'
        utterance.rate = 0.8
        speechSynthesis.speak(utterance)
      } else {
        ElMessage.warning('您的浏览器不支持语音合成')
      }
    }

    // 确认删除
    const confirmDelete = (word) => {
      currentWordToDelete.value = word
      deleteDialogVisible.value = true
    }

    // 删除单词
    const deleteWord = async () => {
      if (!currentWordToDelete.value) return
      
      deleting.value = true
      
      try {
        // 模拟异步删除
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const wordId = currentWordToDelete.value.id
        words.value = words.value.filter(word => word.id !== wordId)
        // filteredWords是计算属性，会自动重新计算，不需要手动修改
        
        deleteDialogVisible.value = false
        currentWordToDelete.value = null
        
        saveWords()
        ElMessage.success('删除成功')
      } catch (error) {
        ElMessage.error('删除失败')
      } finally {
        deleting.value = false
      }
    }

    // 保存单词数据
    const saveWords = () => {
      localStorage.setItem('dailyEnglishWords', JSON.stringify(words.value))
      emit('words-updated', words.value)
    }

    // 批量删除单词
    const batchDelete = async () => {
      if (selectedWords.value.length === 0) {
        ElMessage.warning('请先选择要删除的单词')
        return
      }
      
      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedWords.value.length} 个单词吗？此操作不可恢复。`,
          '批量删除确认',
          {
            confirmButtonText: '确定删除',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        
        deleting.value = true
        
        // 模拟异步删除
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 从原始数据中删除选中的单词
        words.value = words.value.filter(word => !selectedWords.value.includes(word.id))
        // filteredWords是计算属性，会自动重新计算，不需要手动修改
        
        // 清空选择
        clearSelection()
        
        saveWords()
        ElMessage.success(`成功删除 ${selectedWords.value.length} 个单词`)
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('批量删除失败')
        }
      } finally {
        deleting.value = false
      }
    }

    // 格式化日期
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    }

    // 分页方法
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    // 分页大小变化处理
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
    }

    // 当前页变化处理
    const handleCurrentChange = (page) => {
      currentPage.value = page
    }

    // 生成搜索建议
    const generateSearchSuggestions = (keyword) => {
      if (!keyword.trim()) {
        searchSuggestions.value = []
        return
      }

      const suggestions = words.value
        .filter(word => 
          word.word.toLowerCase().includes(keyword.toLowerCase()) ||
          word.meaning.toLowerCase().includes(keyword.toLowerCase())
        )
        .slice(0, 5)
        .map(word => ({
          word: word.word,
          type: word.partOfSpeech || 'unknown',
          meaning: word.meaning.substring(0, 50) + (word.meaning.length > 50 ? '...' : '')
        }))

      searchSuggestions.value = suggestions
    }

    // 选择搜索建议
    const selectSuggestion = (suggestion) => {
      searchForm.keyword = suggestion.word
      showSearchSuggestions.value = false
      handleSearch()
    }

    // 隐藏搜索建议
    const hideSearchSuggestions = () => {
      setTimeout(() => {
        showSearchSuggestions.value = false
      }, 200)
    }

    // 关闭单词菜单
    const closeWordMenu = () => {
      showWordMenu.value = false
      currentWordMenu.value = null
    }

    // 组件挂载时初始化
    onMounted(() => {
      loadWords()
      handleSearch() // 初始加载时执行一次搜索以显示所有单词
    })

    // 组件卸载时清理定时器
    onUnmounted(() => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    })

    return {
      // 数据
      searchForm,
      advancedFilters,
      words,
      filteredWords,
      displayWords,
      popularTags,
      
      // 状态
      loading,
      searching,
      hasSearch,
      showSidebar,
      currentPage,
      pageSize,
      totalPages,
      visiblePages,
      activeFilterCount,
      hasActiveFilters,
      deleteDialogVisible,
      currentWordToDelete,
      deleting,
      expandedWords,
      showAdvancedFilters,
      showBatchMode,
      showAddWordModal,
      selectedWordId,
      selectedWords,
      viewMode,
      showWordMenu: showWordMenuFunc,
      currentWordMenu,
      menuPosition,
      showSearchSuggestions,
      searchSuggestions,
      
      // 配置
      searchOptions,
      partOfSpeechOptions,
      sortOptions,
      quickFilters,
      
      // 计算属性
      weeklyNewWords,
      masteredWords,
      
      // 方法
      loadWords,
      handleSearch,
      clearSearch,
      clearKeyword,
      setQuickFilter,
      setSortOption,
      togglePartOfSpeech,
      toggleTag,
      clearAllFilters,
      toggleAdvancedFilters,
      handleWordClick,
      selectWord,
      isSelectedWord,
      toggleWordSelection,
      selectAllWords,
      clearSelection,
      toggleBatchMode,
      batchDelete,
      exportSelected,
      showWordMenu,
      hideWordMenu,
      editWord,
      toggleWordDetail,
      pronounceWord,
      confirmDelete,
      deleteWord,
      saveWords,
      formatDate,
      prevPage,
      nextPage,
      goToPage,
      generateSearchSuggestions,
      selectSuggestion,
      hideSearchSuggestions,
      debouncedSearch,
      handleSizeChange,
      handleCurrentChange,
      closeWordMenu
    }
  }
}
</script>

<style>
/* ===== 全局变量 ===== */
:root {
  /* 基础颜色变量 */
  --primary-color: #4F46E5;
  --primary-hover: #4338CA;
  --primary-light: #EEF2FF;
  --secondary-color: #6B7280;
  --success-color: #10B981;
  --warning-color: #F59E0B;
  --danger-color: #EF4444;
  --background: #F9FAFB;
  --surface: #FFFFFF;
  --border: #E5E7EB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  /* SearchWords 组件专用变量 --sw- 前缀 */
  --sw-primary-50: #EEF2FF;
  --sw-primary-100: #E0E7FF;
  --sw-primary-200: #C7D2FE;
  --sw-primary-300: #A5B4FC;
  --sw-primary-400: #818CF8;
  --sw-primary-500: #6366F1;
  --sw-primary-600: #4F46E5;
  --sw-primary-700: #4338CA;
  --sw-primary-800: #3730A3;
  --sw-primary-900: #312E81;
  
  --sw-gray-50: #F9FAFB;
  --sw-gray-100: #F3F4F6;
  --sw-gray-200: #E5E7EB;
  --sw-gray-300: #D1D5DB;
  --sw-gray-400: #9CA3AF;
  --sw-gray-500: #6B7280;
  --sw-gray-600: #4B5563;
  --sw-gray-700: #374151;
  --sw-gray-800: #1F2937;
  --sw-gray-900: #111827;
  
  --sw-space-1: 0.25rem;
  --sw-space-2: 0.5rem;
  --sw-space-3: 0.75rem;
  --sw-space-4: 1rem;
  --sw-space-5: 1.25rem;
  --sw-space-6: 1.5rem;
  --sw-space-8: 2rem;
  --sw-space-10: 2.5rem;
  --sw-space-12: 3rem;
  
  --sw-radius-sm: 6px;
  --sw-radius-md: 8px;
  --sw-radius-lg: 12px;
  --sw-radius-xl: 16px;
  
  --sw-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --sw-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --sw-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --sw-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  --sw-transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --sw-transition-normal: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  --sw-transition-slow: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  --sw-ease-out: cubic-bezier(0, 0, 0.2, 1);
  --sw-ease-in: cubic-bezier(0.4, 0, 1, 1);
  --sw-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

<style scoped>
/* 基础容器 */
.search-words-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  flex-direction: column;
}

/* 应用头部 */
.app-header {
  background: white;
  border-bottom: 1px solid var(--sw-gray-200);
  padding: var(--sw-space-6) var(--sw-space-8);
  box-shadow: var(--sw-shadow-sm);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--sw-space-8);
}

.app-title {
  display: flex;
  align-items: center;
  gap: var(--sw-space-3);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--sw-gray-900);
  margin: 0;
}

.app-icon {
  color: var(--sw-primary-600);
}

.header-stats {
  display: flex;
  gap: var(--sw-space-6);
}

.header-stats .stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--sw-space-2) var(--sw-space-4);
  background: var(--sw-gray-50);
  border-radius: var(--sw-radius-lg);
}

.header-stats .stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--sw-primary-600);
}

.header-stats .stat-label {
  font-size: 0.75rem;
  color: var(--sw-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.header-actions {
  display: flex;
  gap: var(--sw-space-3);
}

/* 主要内容区域 */
.main-content {
  flex: 1;
  padding: var(--sw-space-6) var(--sw-space-8);
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* 搜索区域 */
.search-section {
  background: white;
  border-radius: var(--sw-radius-xl);
  padding: var(--sw-space-6);
  box-shadow: var(--sw-shadow-md);
  margin-bottom: var(--sw-space-6);
}

.search-container {
  position: relative;
  margin-bottom: var(--sw-space-4);
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper .search-icon {
  position: absolute;
  left: var(--sw-space-4);
  color: var(--sw-gray-400);
  pointer-events: none;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: var(--sw-space-4) var(--sw-space-4) var(--sw-space-4) var(--sw-space-12);
  border: 2px solid var(--sw-gray-200);
  border-radius: var(--sw-radius-xl);
  font-size: 1rem;
  transition: all var(--sw-transition-normal);
  background: var(--sw-gray-50);
}

.search-input:focus {
  outline: none;
  border-color: var(--sw-primary-500);
  background: white;
  box-shadow: 0 0 0 3px var(--sw-primary-100);
}

.search-input::placeholder {
  color: var(--sw-gray-400);
}

.clear-btn {
  position: absolute;
  right: var(--sw-space-3);
  background: none;
  border: none;
  padding: var(--sw-space-2);
  border-radius: var(--sw-radius-md);
  color: var(--sw-gray-400);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.clear-btn:hover {
  background: var(--sw-gray-100);
  color: var(--sw-gray-600);
}

/* 搜索建议 */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--sw-gray-200);
  border-radius: var(--sw-radius-lg);
  box-shadow: var(--sw-shadow-lg);
  z-index: 50;
  max-height: 200px;
  overflow-y: auto;
  margin-top: var(--sw-space-2);
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sw-space-3) var(--sw-space-4);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.suggestion-item:hover {
  background: var(--sw-gray-50);
}

.suggestion-text {
  font-weight: 500;
  color: var(--sw-gray-900);
}

.suggestion-type {
  font-size: 0.75rem;
  color: var(--sw-gray-500);
  text-transform: uppercase;
  background: var(--sw-gray-100);
  padding: var(--sw-space-1) var(--sw-space-2);
  border-radius: var(--sw-radius-sm);
}

/* 快捷筛选 */
.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sw-space-2);
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--sw-space-2);
  padding: var(--sw-space-2) var(--sw-space-4);
  border: 1px solid var(--sw-gray-300);
  border-radius: var(--sw-radius-lg);
  background: white;
  color: var(--sw-gray-700);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.filter-chip:hover {
  background: var(--sw-gray-50);
  border-color: var(--sw-gray-400);
}

.filter-chip.active {
  background: var(--sw-primary-600);
  border-color: var(--sw-primary-600);
  color: white;
}

.filter-toggle {
  position: relative;
}

.filter-count {
  background: var(--sw-danger-color);
  color: white;
  font-size: 0.75rem;
  padding: var(--sw-space-1) var(--sw-space-2);
  border-radius: var(--sw-radius-sm);
  min-width: 18px;
  text-align: center;
}

/* 高级筛选面板 */
.advanced-filters {
  background: white;
  border-radius: var(--sw-radius-xl);
  padding: var(--sw-space-6);
  box-shadow: var(--sw-shadow-md);
  margin-bottom: var(--sw-space-6);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--sw-space-6);
  margin-bottom: var(--sw-space-6);
}

.filter-group h4 {
  margin: 0 0 var(--sw-space-3) 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--sw-gray-700);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-options, .sort-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sw-space-2);
}

.filter-option, .sort-option {
  padding: var(--sw-space-2) var(--sw-space-3);
  border: 1px solid var(--sw-gray-300);
  border-radius: var(--sw-radius-md);
  background: white;
  color: var(--sw-gray-700);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.filter-option:hover, .sort-option:hover {
  background: var(--sw-gray-50);
  border-color: var(--sw-gray-400);
}

.filter-option.active, .sort-option.active {
  background: var(--sw-primary-600);
  border-color: var(--sw-primary-600);
  color: white;
}

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sw-space-2);
}

.tag-chip {
  padding: var(--sw-space-1) var(--sw-space-3);
  border: 1px solid var(--sw-gray-300);
  border-radius: var(--sw-radius-lg);
  background: white;
  color: var(--sw-gray-700);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.tag-chip:hover {
  background: var(--sw-gray-50);
  border-color: var(--sw-gray-400);
}

.tag-chip.active {
  background: var(--sw-primary-100);
  border-color: var(--sw-primary-300);
  color: var(--sw-primary-700);
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--sw-space-3);
}

/* 结果区域 */
.results-section {
  background: white;
  border-radius: var(--sw-radius-xl);
  box-shadow: var(--sw-shadow-md);
  overflow: hidden;
}

.results-header {
  padding: var(--sw-space-6);
  border-bottom: 1px solid var(--sw-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--sw-gray-900);
  margin: 0;
}

.results-count {
  color: var(--sw-gray-500);
  font-weight: 400;
}

.results-actions {
  display: flex;
  align-items: center;
  gap: var(--sw-space-4);
}

.view-switcher {
  display: flex;
  background: var(--sw-gray-100);
  border-radius: var(--sw-radius-md);
  padding: var(--sw-space-1);
}

.view-btn {
  padding: var(--sw-space-2) var(--sw-space-3);
  border: none;
  background: transparent;
  color: var(--sw-gray-600);
  border-radius: var(--sw-radius-sm);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.view-btn:hover {
  color: var(--sw-gray-900);
}

.view-btn.active {
  background: white;
  color: var(--sw-primary-600);
  box-shadow: var(--sw-shadow-sm);
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sw-space-2);
  padding: var(--sw-space-3) var(--sw-space-4);
  border: none;
  border-radius: var(--sw-radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--sw-transition-fast);
  text-decoration: none;
}

.btn-primary {
  background: var(--sw-primary-600);
  color: white;
}

.btn-primary:hover {
  background: var(--sw-primary-700);
}

.btn-secondary {
  background: var(--sw-gray-100);
  color: var(--sw-gray-700);
  border: 1px solid var(--sw-gray-300);
}

.btn-secondary:hover {
  background: var(--sw-gray-200);
  color: var(--sw-gray-900);
}

/* 单词容器 */
.words-container {
  min-height: 400px;
}

/* 加载状态 */
.loading-state {
  padding: var(--sw-space-8);
}

.loading-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--sw-space-4);
}

.skeleton-card {
  background: var(--sw-gray-50);
  border-radius: var(--sw-radius-lg);
  padding: var(--sw-space-4);
  border: 1px solid var(--sw-gray-200);
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sw-space-3);
}

.skeleton-title {
  width: 120px;
  height: 20px;
  background: var(--sw-gray-200);
  border-radius: var(--sw-radius-sm);
  animation: skeleton-loading 1.5s infinite ease-in-out;
}

.skeleton-actions {
  width: 80px;
  height: 32px;
  background: var(--sw-gray-200);
  border-radius: var(--sw-radius-sm);
  animation: skeleton-loading 1.5s infinite ease-in-out;
}

.skeleton-content {
  width: 100%;
  height: 40px;
  background: var(--sw-gray-200);
  border-radius: var(--sw-radius-sm);
  margin-bottom: var(--sw-space-3);
  animation: skeleton-loading 1.5s infinite ease-in-out;
}

.skeleton-tags {
  display: flex;
  gap: var(--sw-space-2);
}

.skeleton-tags::before,
.skeleton-tags::after {
  content: '';
  width: 60px;
  height: 24px;
  background: var(--sw-gray-200);
  border-radius: var(--sw-radius-lg);
  animation: skeleton-loading 1.5s infinite ease-in-out;
}

@keyframes skeleton-loading {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: var(--sw-space-12) var(--sw-space-8);
  color: var(--sw-gray-500);
}

.empty-icon {
  margin: 0 auto var(--sw-space-6);
  color: var(--sw-gray-300);
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--sw-gray-700);
  margin: 0 0 var(--sw-space-2) 0;
}

.empty-state p {
  font-size: 0.875rem;
  margin: 0 0 var(--sw-space-6) 0;
}

.empty-actions {
  display: flex;
  gap: var(--sw-space-3);
  justify-content: center;
}

/* 单词网格 */
.words-grid {
  padding: var(--sw-space-4);
}

.words-grid.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--sw-space-4);
}

.words-grid.list {
  display: flex;
  flex-direction: column;
  gap: var(--sw-space-3);
}

/* 单词卡片 */
.word-card {
  background: white;
  border: 1px solid var(--sw-gray-200);
  border-radius: var(--sw-radius-lg);
  transition: all var(--sw-transition-normal);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.word-card:hover {
  border-color: var(--sw-primary-300);
  box-shadow: var(--sw-shadow-md);
  transform: translateY(-2px);
}

.word-card.selected {
  border-color: var(--sw-primary-500);
  background: var(--sw-primary-50);
}

.word-card.batch-selected {
  border-color: var(--sw-primary-500);
  box-shadow: 0 0 0 2px var(--sw-primary-200);
}

.word-card.expanded {
  box-shadow: var(--sw-shadow-lg);
}

/* 批量选择复选框 */
.batch-checkbox {
  position: absolute;
  top: var(--sw-space-3);
  left: var(--sw-space-3);
  z-index: 10;
  background: white;
  border-radius: var(--sw-radius-md);
  padding: var(--sw-space-2);
  box-shadow: var(--sw-shadow-sm);
}

.batch-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--sw-primary-600);
  cursor: pointer;
}

/* 卡片内容 */
.card-content {
  padding: var(--sw-space-4);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--sw-space-3);
}

.word-info {
  flex: 1;
}

.word-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--sw-gray-900);
  margin: 0 0 var(--sw-space-1) 0;
  line-height: 1.3;
}

.word-phonetic {
  font-size: 0.875rem;
  color: var(--sw-gray-500);
  font-family: 'Courier New', monospace;
}

.card-actions {
  display: flex;
  gap: var(--sw-space-1);
  opacity: 0;
  transition: opacity var(--sw-transition-fast);
}

.word-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  padding: var(--sw-space-2);
  border-radius: var(--sw-radius-md);
  color: var(--sw-gray-400);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.action-btn:hover {
  background: var(--sw-gray-100);
  color: var(--sw-gray-600);
}

/* 卡片主体 */
.card-body {
  margin-bottom: var(--sw-space-3);
}

.word-meta {
  display: flex;
  gap: var(--sw-space-3);
  margin-bottom: var(--sw-space-2);
}

.part-of-speech {
  font-size: 0.75rem;
  color: var(--sw-primary-600);
  background: var(--sw-primary-100);
  padding: var(--sw-space-1) var(--sw-space-2);
  border-radius: var(--sw-radius-sm);
  text-transform: uppercase;
  font-weight: 500;
}

.word-date {
  font-size: 0.75rem;
  color: var(--sw-gray-500);
}

.word-meaning {
  font-size: 0.875rem;
  color: var(--sw-gray-700);
  line-height: 1.5;
  margin: 0 0 var(--sw-space-3) 0;
}

.word-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sw-space-2);
}

.tag {
  font-size: 0.75rem;
  color: var(--sw-gray-600);
  background: var(--sw-gray-100);
  padding: var(--sw-space-1) var(--sw-space-2);
  border-radius: var(--sw-radius-lg);
}

.more-tags {
  font-size: 0.75rem;
  color: var(--sw-gray-400);
  padding: var(--sw-space-1) var(--sw-space-2);
}

/* 展开详情 */
.card-details {
  border-top: 1px solid var(--sw-gray-200);
  padding-top: var(--sw-space-3);
  margin-top: var(--sw-space-3);
}

.detail-item {
  margin-bottom: var(--sw-space-3);
}

.detail-item h4 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--sw-gray-700);
  margin: 0 0 var(--sw-space-2) 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item p {
  font-size: 0.875rem;
  color: var(--sw-gray-600);
  line-height: 1.5;
  margin: 0;
}

.detail-actions {
  display: flex;
  gap: var(--sw-space-2);
  margin-top: var(--sw-space-3);
}

.btn-sm {
  padding: var(--sw-space-2) var(--sw-space-3);
  font-size: 0.75rem;
}

.btn-danger {
  background: var(--sw-danger-color);
  color: white;
}

.btn-danger:hover {
  background: #DC2626;
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all var(--sw-transition-normal);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 300px;
  opacity: 1;
}

/* 分页 */
.pagination {
  padding: var(--sw-space-6);
  border-top: 1px solid var(--sw-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--sw-space-4);
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: var(--sw-space-4);
  font-size: 0.875rem;
  color: var(--sw-gray-600);
}

.page-size-select {
  padding: var(--sw-space-2);
  border: 1px solid var(--sw-gray-300);
  border-radius: var(--sw-radius-md);
  background: white;
  font-size: 0.875rem;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--sw-space-2);
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--sw-gray-300);
  background: white;
  border-radius: var(--sw-radius-md);
  color: var(--sw-gray-600);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--sw-gray-50);
  border-color: var(--sw-gray-400);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn.active {
  background: var(--sw-primary-600);
  border-color: var(--sw-primary-600);
  color: white;
}

.pagination-ellipsis {
  padding: 0 var(--sw-space-2);
  color: var(--sw-gray-400);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--sw-space-4);
    align-items: stretch;
  }
  
  .header-left {
    flex-direction: column;
    gap: var(--sw-space-4);
  }
  
  .main-content {
    padding: var(--sw-space-4);
  }
  
  .words-grid.grid {
    grid-template-columns: 1fr;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .results-header {
    flex-direction: column;
    gap: var(--sw-space-4);
    align-items: stretch;
  }
  
  .pagination {
    flex-direction: column;
    gap: var(--sw-space-4);
  }
  
  .pagination-info {
    flex-direction: column;
    gap: var(--sw-space-2);
    text-align: center;
  }
}

/* 右键菜单 */
.word-menu {
  position: fixed;
  background: white;
  border: 1px solid var(--sw-gray-200);
  border-radius: var(--sw-radius-lg);
  box-shadow: var(--sw-shadow-xl);
  z-index: 1000;
  min-width: 160px;
  padding: var(--sw-space-2);
  animation: menu-appear 0.15s ease-out;
}

@keyframes menu-appear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--sw-space-3);
  padding: var(--sw-space-2) var(--sw-space-3);
  border-radius: var(--sw-radius-md);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
  font-size: 0.875rem;
  color: var(--sw-gray-700);
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.menu-item:hover {
  background: var(--sw-gray-100);
  color: var(--sw-gray-900);
}

.menu-item.danger {
  color: var(--sw-danger-color);
}

.menu-item.danger:hover {
  background: var(--sw-danger-color);
  color: white;
}

.menu-divider {
  height: 1px;
  background: var(--sw-gray-200);
  margin: var(--sw-space-2) 0;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: var(--sw-space-4);
  animation: modal-fade-in 0.2s ease-out;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  background: white;
  border-radius: var(--sw-radius-xl);
  box-shadow: var(--sw-shadow-xl);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  animation: modal-slide-in 0.3s ease-out;
}

@keyframes modal-slide-in {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  padding: var(--sw-space-6);
  border-bottom: 1px solid var(--sw-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--sw-gray-900);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  padding: var(--sw-space-2);
  border-radius: var(--sw-radius-md);
  color: var(--sw-gray-400);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.modal-close:hover {
  background: var(--sw-gray-100);
  color: var(--sw-gray-600);
}

.modal-body {
  padding: var(--sw-space-6);
  text-align: center;
}

.modal-icon {
  margin: 0 auto var(--sw-space-4);
  color: var(--sw-warning-color);
}

.modal-body p {
  margin: 0 0 var(--sw-space-2) 0;
  color: var(--sw-gray-700);
  font-size: 0.875rem;
}

.warning-text {
  color: var(--sw-danger-color) !important;
  font-weight: 500;
}

.modal-footer {
  padding: var(--sw-space-6);
  border-top: 1px solid var(--sw-gray-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--sw-space-3);
}

/* 浮动操作按钮 */
.fab {
  position: fixed;
  bottom: var(--sw-space-8);
  right: var(--sw-space-8);
  width: 56px;
  height: 56px;
  background: var(--sw-primary-600);
  color: white;
  border: none;
  border-radius: 50%;
  box-shadow: var(--sw-shadow-lg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--sw-transition-normal);
  z-index: 100;
}

.fab:hover {
  background: var(--sw-primary-700);
  transform: scale(1.1);
  box-shadow: var(--sw-shadow-xl);
}

.fab:active {
  transform: scale(0.95);
}

/* 批量操作栏 */
.batch-actions {
  padding: var(--sw-space-4) var(--sw-space-6);
  background: var(--sw-primary-50);
  border-bottom: 1px solid var(--sw-primary-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.batch-info {
  display: flex;
  align-items: center;
  gap: var(--sw-space-3);
  font-size: 0.875rem;
  color: var(--sw-primary-700);
}

.batch-buttons {
  display: flex;
  gap: var(--sw-space-2);
}

/* Element Plus 样式覆盖 */
.el-date-editor.el-input__wrapper {
  width: 100%;
}

.el-date-editor.el-input__wrapper:hover {
  border-color: var(--sw-primary-500);
}

.el-date-editor.is-focus .el-input__wrapper {
  border-color: var(--sw-primary-500);
  box-shadow: 0 0 0 2px var(--sw-primary-100);
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: var(--sw-gray-100);
  border-radius: var(--sw-radius-sm);
}

::-webkit-scrollbar-thumb {
  background: var(--sw-gray-300);
  border-radius: var(--sw-radius-sm);
  transition: background var(--sw-transition-fast);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--sw-gray-400);
}

/* 焦点样式 */
*:focus {
  outline: 2px solid var(--sw-primary-500);
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}

/* 打印样式 */
@media print {
  .app-header,
  .search-section,
  .results-header,
  .word-card:hover .card-actions,
  .batch-checkbox,
  .pagination,
  .fab {
    display: none !important;
  }
  
  .words-grid.grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--sw-space-2);
  }
  
  .word-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid var(--sw-gray-300);
  }
}

/* 搜索头部 */
.search-header {
  background: white;
  border-bottom: 1px solid var(--sw-gray-200);
  padding: var(--sw-space-6) var(--sw-space-8);
  box-shadow: var(--sw-shadow-sm);
}

.search-header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-title-section {
  display: flex;
  align-items: center;
  gap: var(--sw-space-4);
}

.search-title-section .search-icon {
  width: 48px;
  height: 48px;
  background: var(--sw-primary-100);
  border-radius: var(--sw-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--sw-primary-600);
}

.search-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--sw-gray-900);
  margin: 0;
  line-height: 1.2;
}

.search-subtitle {
  font-size: 0.875rem;
  color: var(--sw-gray-500);
  margin: var(--sw-space-1) 0 0 0;
}

.search-stats {
  display: flex;
  align-items: center;
  gap: var(--sw-space-6);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--sw-primary-600);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--sw-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-query {
  font-size: 0.875rem;
  color: var(--sw-gray-600);
  font-style: italic;
}

/* 主要内容区域 */
.search-main {
  flex: 1;
  display: flex;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  gap: var(--sw-space-6);
  padding: var(--sw-space-6);
}

/* 侧边栏 */
.search-sidebar {
  width: 280px;
  background: white;
  border-radius: var(--sw-radius-xl);
  box-shadow: var(--sw-shadow-md);
  overflow: hidden;
  transition: all var(--sw-transition-normal) var(--sw-ease-out);
  height: fit-content;
  position: sticky;
  top: var(--sw-space-6);
}

.search-sidebar.sidebar-collapsed {
  width: 60px;
}

.sidebar-header {
  padding: var(--sw-space-6);
  border-bottom: 1px solid var(--sw-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--sw-gray-900);
}

.sidebar-toggle {
  background: none;
  border: none;
  padding: var(--sw-space-2);
  border-radius: var(--sw-radius-md);
  color: var(--sw-gray-500);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.sidebar-toggle:hover {
  background: var(--sw-gray-100);
  color: var(--sw-gray-700);
}

.sidebar-content {
  padding: var(--sw-space-6);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* 筛选部分 */
.filter-section {
  margin-bottom: var(--sw-space-6);
}

.filter-section:last-child {
  margin-bottom: 0;
}

.filter-section h4 {
  margin: 0 0 var(--sw-space-3) 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--sw-gray-700);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* 单选按钮组 */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--sw-space-2);
}

.radio-item {
  display: flex;
  align-items: center;
  padding: var(--sw-space-3);
  border-radius: var(--sw-radius-md);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
  border: 1px solid transparent;
}

.radio-item:hover {
  background: var(--sw-gray-50);
}

.radio-item.active {
  background: var(--sw-primary-50);
  border-color: var(--sw-primary-200);
}

.radio-item input[type="radio"] {
  margin-right: var(--sw-space-3);
  accent-color: var(--sw-primary-600);
}

.radio-label {
  font-size: 0.875rem;
  color: var(--sw-gray-700);
}

/* 复选框组 */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: var(--sw-space-2);
}

.checkbox-item {
  display: flex;
  align-items: center;
  padding: var(--sw-space-3);
  border-radius: var(--sw-radius-md);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.checkbox-item:hover {
  background: var(--sw-gray-50);
}

.checkbox-item.active {
  background: var(--sw-primary-50);
}

.checkbox-item input[type="checkbox"] {
  margin-right: var(--sw-space-3);
  accent-color: var(--sw-primary-600);
}

.checkbox-label {
  font-size: 0.875rem;
  color: var(--sw-gray-700);
}

/* 标签云 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sw-space-2);
}

.tag-button {
  padding: var(--sw-space-1) var(--sw-space-3);
  border: 1px solid var(--sw-gray-300);
  border-radius: var(--sw-radius-full);
  background: white;
  font-size: 0.75rem;
  color: var(--sw-gray-600);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.tag-button:hover {
  border-color: var(--sw-primary-300);
  color: var(--sw-primary-600);
}

.tag-button.active {
  background: var(--sw-primary-600);
  border-color: var(--sw-primary-600);
  color: white;
}

/* 清空筛选按钮 */
.clear-filters-btn {
  width: 100%;
  padding: var(--sw-space-3);
  background: var(--sw-gray-100);
  border: none;
  border-radius: var(--sw-radius-md);
  font-size: 0.875rem;
  color: var(--sw-gray-700);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
  margin-top: var(--sw-space-4);
}

.clear-filters-btn:hover {
  background: var(--sw-gray-200);
  color: var(--sw-gray-900);
}

/* 内容区域 */
.search-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--sw-space-6);
}

/* 搜索栏 */
.search-bar-container {
  background: white;
  border-radius: var(--sw-radius-xl);
  box-shadow: var(--sw-shadow-md);
  padding: var(--sw-space-6);
}

.search-bar {
  display: flex;
  gap: var(--sw-space-4);
  align-items: center;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input-wrapper .search-icon {
  position: absolute;
  left: var(--sw-space-4);
  color: var(--sw-gray-400);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--sw-space-3) var(--sw-space-4) var(--sw-space-3) calc(var(--sw-space-4) + 32px);
  border: 2px solid var(--sw-gray-200);
  border-radius: var(--sw-radius-lg);
  font-size: 1rem;
  transition: all var(--sw-transition-fast);
  background: var(--sw-gray-50);
}

.search-input:focus {
  outline: none;
  border-color: var(--sw-primary-500);
  background: white;
  box-shadow: 0 0 0 3px var(--sw-primary-100);
}

.clear-input-btn {
  position: absolute;
  right: var(--sw-space-3);
  background: none;
  border: none;
  padding: var(--sw-space-2);
  border-radius: var(--sw-radius-md);
  color: var(--sw-gray-400);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.clear-input-btn:hover {
  background: var(--sw-gray-100);
  color: var(--sw-gray-600);
}

.search-actions {
  display: flex;
  gap: var(--sw-space-3);
}

.filter-toggle-btn {
  display: flex;
  align-items: center;
  gap: var(--sw-space-2);
  padding: var(--sw-space-3) var(--sw-space-4);
  background: white;
  border: 2px solid var(--sw-gray-200);
  border-radius: var(--sw-radius-lg);
  font-size: 0.875rem;
  color: var(--sw-gray-700);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
  position: relative;
}

.filter-toggle-btn:hover {
  border-color: var(--sw-primary-300);
  color: var(--sw-primary-600);
}

.filter-toggle-btn.active {
  background: var(--sw-primary-600);
  border-color: var(--sw-primary-600);
  color: white;
}

.filter-count {
  background: var(--sw-danger);
  color: white;
  font-size: 0.625rem;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--sw-radius-full);
  min-width: 18px;
  text-align: center;
}

/* 快捷筛选 */
.quick-filters {
  margin-top: var(--sw-space-4);
}

.quick-filter-chips {
  display: flex;
  gap: var(--sw-space-2);
}

.quick-filter-chip {
  padding: var(--sw-space-2) var(--sw-space-3);
  background: var(--sw-gray-100);
  border: 1px solid var(--sw-gray-200);
  border-radius: var(--sw-radius-full);
  font-size: 0.75rem;
  color: var(--sw-gray-600);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.quick-filter-chip:hover {
  background: var(--sw-gray-200);
  color: var(--sw-gray-800);
}

.quick-filter-chip.active {
  background: var(--sw-primary-600);
  border-color: var(--sw-primary-600);
  color: white;
}

/* 结果容器 */
.results-container {
  flex: 1;
}

/* 加载状态 */
.loading-state {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--sw-space-6);
}

.skeleton-card {
  background: white;
  border-radius: var(--sw-radius-xl);
  padding: var(--sw-space-6);
  box-shadow: var(--sw-shadow-md);
}

.skeleton-header {
  margin-bottom: var(--sw-space-4);
}

.skeleton-title {
  height: 24px;
  background: linear-gradient(90deg, var(--sw-gray-200) 25%, var(--sw-gray-100) 50%, var(--sw-gray-200) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: var(--sw-radius-md);
  width: 60%;
  margin-bottom: var(--sw-space-3);
}

.skeleton-meta {
  height: 16px;
  background: linear-gradient(90deg, var(--sw-gray-200) 25%, var(--sw-gray-100) 50%, var(--sw-gray-200) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: var(--sw-radius-md);
  width: 40%;
}

.skeleton-content {
  height: 16px;
  background: linear-gradient(90deg, var(--sw-gray-200) 25%, var(--sw-gray-100) 50%, var(--sw-gray-200) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: var(--sw-radius-md);
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--sw-space-16);
  text-align: center;
}

.empty-illustration {
  color: var(--sw-gray-300);
  margin-bottom: var(--sw-space-6);
}

.empty-state h3 {
  margin: 0 0 var(--sw-space-3) 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--sw-gray-900);
}

.empty-state p {
  margin: 0 0 var(--sw-space-6) 0;
  color: var(--sw-gray-500);
}

.reset-search-btn {
  padding: var(--sw-space-3) var(--sw-space-6);
  background: var(--sw-primary-600);
  color: white;
  border: none;
  border-radius: var(--sw-radius-lg);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.reset-search-btn:hover {
  background: var(--sw-primary-700);
  transform: translateY(-1px);
  box-shadow: var(--sw-shadow-lg);
}

/* 结果网格 */
.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--sw-space-6);
}

/* 单词卡片 */
.word-card {
  background: white;
  border-radius: var(--sw-radius-xl);
  box-shadow: var(--sw-shadow-md);
  overflow: hidden;
  transition: all var(--sw-transition-normal) var(--sw-ease-out);
  cursor: pointer;
  border: 2px solid transparent;
}

.word-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--sw-shadow-xl);
}

.word-card.selected {
  border-color: var(--sw-primary-500);
  box-shadow: 0 0 0 3px var(--sw-primary-100);
}

.word-card.expanded {
  grid-column: span 2;
}

.word-card-header {
  padding: var(--sw-space-6);
}

.word-main {
  display: flex;
  flex-direction: column;
  gap: var(--sw-space-3);
}

.word-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--sw-space-3);
}

.word-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--sw-gray-900);
  line-height: 1.2;
}

.word-actions {
  display: flex;
  gap: var(--sw-space-2);
  opacity: 0;
  transition: opacity var(--sw-transition-fast);
}

.word-card:hover .word-actions {
  opacity: 1;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--sw-gray-100);
  border: none;
  border-radius: var(--sw-radius-md);
  color: var(--sw-gray-600);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.action-btn:hover {
  background: var(--sw-primary-100);
  color: var(--sw-primary-600);
}

.pronounce-btn:hover {
  background: var(--sw-success);
  color: white;
}

.delete-btn:hover {
  background: var(--sw-danger);
  color: white;
}

.word-meta-row {
  display: flex;
  align-items: center;
  gap: var(--sw-space-3);
  flex-wrap: wrap;
}

.phonetic {
  font-size: 0.875rem;
  color: var(--sw-gray-500);
  font-style: italic;
}

.part-of-speech {
  font-size: 0.75rem;
  padding: 2px 8px;
  background: var(--sw-primary-100);
  color: var(--sw-primary-700);
  border-radius: var(--sw-radius-full);
  font-weight: 500;
}

.date {
  font-size: 0.75rem;
  color: var(--sw-gray-400);
}

.word-content {
  padding: 0 var(--sw-space-6) var(--sw-space-6);
}

.word-meaning {
  margin: 0 0 var(--sw-space-4) 0;
  font-size: 0.875rem;
  color: var(--sw-gray-700);
  line-height: 1.6;
}

.word-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sw-space-2);
}

.word-tag {
  font-size: 0.75rem;
  padding: 2px 8px;
  background: var(--sw-gray-100);
  color: var(--sw-gray-600);
  border-radius: var(--sw-radius-full);
}

/* 单词详情 */
.word-details {
  padding: var(--sw-space-6);
  border-top: 1px solid var(--sw-gray-200);
  background: var(--sw-gray-50);
}

.detail-section {
  margin-bottom: var(--sw-space-4);
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 var(--sw-space-2) 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--sw-gray-700);
}

.example-text {
  font-style: italic;
  color: var(--sw-gray-600);
  line-height: 1.6;
  padding-left: var(--sw-space-4);
  border-left: 3px solid var(--sw-primary-300);
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all var(--sw-transition-normal) var(--sw-ease-out);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 500px;
  opacity: 1;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sw-space-6) 0;
  margin-top: var(--sw-space-8);
}

.pagination-info {
  font-size: 0.875rem;
  color: var(--sw-gray-500);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--sw-space-2);
}

.pagination-btn {
  padding: var(--sw-space-2) var(--sw-space-4);
  background: white;
  border: 1px solid var(--sw-gray-300);
  border-radius: var(--sw-radius-md);
  font-size: 0.875rem;
  color: var(--sw-gray-700);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--sw-gray-50);
  border-color: var(--sw-gray-400);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: var(--sw-space-1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .words-display.grid {
    grid-template-columns: 1fr;
  }
  
  .bottom-action-bar {
    padding: var(--sw-space-3);
  }
  
  .batch-actions {
    flex-direction: column;
    gap: var(--sw-space-3);
    align-items: stretch;
  }
  
  .batch-buttons {
    justify-content: center;
  }
  
  .quick-stats {
    gap: var(--sw-space-4);
  }
  
  .floating-actions {
    bottom: var(--sw-space-4);
    right: var(--sw-space-4);
  }
  
  .fab-btn {
    width: 48px;
    height: 48px;
  }
  
  .pagination-modern {
    flex-direction: column;
    gap: var(--sw-space-3);
  }
  
  .pagination-info {
    flex-direction: column;
    gap: var(--sw-space-2);
    align-items: center;
  }
}

@media (max-width: 480px) {
  .word-card-modern {
    margin: 0 -var(--sw-space-2);
    border-radius: 0;
  }
  
  .card-header {
    padding: var(--sw-space-3);
  }
  
  .card-content {
    padding: 0 var(--sw-space-3) var(--sw-space-3);
  }
  
  .word-title {
    font-size: var(--sw-font-size-lg);
  }
  
  .batch-actions {
    font-size: var(--sw-font-size-sm);
  }
  
  .stat-value {
    font-size: var(--sw-font-size-base);
  }
}

.page-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--sw-gray-300);
  border-radius: var(--sw-radius-md);
  font-size: 0.875rem;
  color: var(--sw-gray-700);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.page-number:hover {
  background: var(--sw-gray-50);
  border-color: var(--sw-gray-400);
}

.page-number.active {
  background: var(--sw-primary-600);
  border-color: var(--sw-primary-600);
  color: white;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: var(--sw-radius-xl);
  box-shadow: var(--sw-shadow-xl);
  max-width: 400px;
  width: 90%;
  overflow: hidden;
  animation: modalSlideIn var(--sw-transition-normal) var(--sw-ease-out);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sw-space-6);
  border-bottom: 1px solid var(--sw-gray-200);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--sw-gray-900);
}

.modal-close {
  background: none;
  border: none;
  padding: var(--sw-space-2);
  border-radius: var(--sw-radius-md);
  color: var(--sw-gray-400);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.modal-close:hover {
  background: var(--sw-gray-100);
  color: var(--sw-gray-600);
}

.modal-body {
  padding: var(--sw-space-6);
  text-align: center;
}

.warning-icon {
  color: var(--sw-warning);
  margin-bottom: var(--sw-space-4);
}

.modal-body p {
  margin: var(--sw-space-2) 0;
  color: var(--sw-gray-700);
}

.warning-text {
  font-size: 0.875rem;
  color: var(--sw-gray-500);
}

.modal-footer {
  display: flex;
  gap: var(--sw-space-3);
  padding: var(--sw-space-6);
  border-top: 1px solid var(--sw-gray-200);
}

.btn {
  padding: var(--sw-space-3) var(--sw-space-6);
  border: none;
  border-radius: var(--sw-radius-lg);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.btn-secondary {
  background: var(--sw-gray-100);
  color: var(--sw-gray-700);
}

.btn-secondary:hover {
  background: var(--sw-gray-200);
}

.btn-danger {
  background: var(--sw-danger);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .search-main {
    flex-direction: column;
  }
  
  .search-sidebar {
    width: 100%;
    position: static;
  }
  
  .search-sidebar.sidebar-collapsed {
    width: 100%;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .word-card.expanded {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .search-header-content {
    flex-direction: column;
    gap: var(--sw-space-4);
    text-align: center;
  }
  
  .search-main {
    padding: var(--sw-space-4);
  }
  
  .search-bar {
    flex-direction: column;
    gap: var(--sw-space-3);
  }
  
  .search-input-wrapper {
    width: 100%;
  }
  
  .search-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .quick-filter-chips {
    flex-wrap: wrap;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: var(--sw-space-4);
    text-align: center;
  }
  
  .modal-content {
    margin: var(--sw-space-4);
  }
}

@media (max-width: 480px) {
  .search-header {
    padding: var(--sw-space-4);
  }
  
  .search-title {
    font-size: 1.5rem;
  }
  
  .search-icon {
    width: 40px;
    height: 40px;
  }
  
  .search-sidebar {
    border-radius: var(--sw-radius-lg);
  }
  
  .sidebar-content {
    padding: var(--sw-space-4);
  }
  
  .search-bar-container {
    padding: var(--sw-space-4);
  }
  
  .word-card-header {
    padding: var(--sw-space-4);
  }
  
  .word-content {
    padding: 0 var(--sw-space-4) var(--sw-space-4);
  }
  
  .word-details {
    padding: var(--sw-space-4);
  }
}

/* 背景装饰元素 - 与AddWord组件一致 */
.search-words-container::before {
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

.search-words-container::after {
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

/* 额外的动画和交互效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--sw-transition-normal) var(--sw-ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all var(--sw-transition-normal) var(--sw-ease-out);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* 脉冲动画 */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 悬停效果增强 */
.word-card {
  position: relative;
  overflow: hidden;
}

.word-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.word-card:hover::before {
  left: 100%;
}

/* 搜索输入框聚焦动画 */
.search-input:focus {
  animation: inputFocus 0.3s var(--sw-ease-out);
}

@keyframes inputFocus {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

/* 按钮点击效果 */
.action-btn:active {
  transform: scale(0.95);
}

.pagination-btn:active {
  transform: scale(0.95);
}

.page-number:active {
  transform: scale(0.95);
}

/* 标签动画 */
.tag-button {
  position: relative;
  overflow: hidden;
}

.tag-button::after {
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

.tag-button:active::after {
  width: 100px;
  height: 100px;
}

/* 加载动画优化 */
.skeleton-card {
  position: relative;
  overflow: hidden;
}

.skeleton-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 滚动条样式 */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: var(--sw-gray-100);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: var(--sw-gray-300);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: var(--sw-gray-400);
}

/* 选择状态动画 */
.word-card.selected {
  animation: selectCard 0.3s var(--sw-ease-out);
}

@keyframes selectCard {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* 筛选器激活动画 */
.filter-toggle-btn.active {
  animation: filterActivate 0.3s var(--sw-ease-out);
}

@keyframes filterActivate {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* 空状态动画 */
.empty-state {
  animation: fadeInUp 0.5s var(--sw-ease-out);
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 模态框背景动画 */
.modal-overlay {
  animation: fadeIn 0.2s var(--sw-ease-out);
}

/* 成功/错误提示 */
.toast {
  position: fixed;
  bottom: var(--sw-space-6);
  right: var(--sw-space-6);
  padding: var(--sw-space-4) var(--sw-space-6);
  background: white;
  border-radius: var(--sw-radius-lg);
  box-shadow: var(--sw-shadow-xl);
  display: flex;
  align-items: center;
  gap: var(--sw-space-3);
  animation: slideInRight 0.3s var(--sw-ease-out);
  z-index: 2000;
}

.toast.success {
  border-left: 4px solid var(--sw-success);
}

.toast.error {
  border-left: 4px solid var(--sw-danger);
}

.toast.warning {
  border-left: 4px solid var(--sw-warning);
}

@keyframes slideInRight {
  0% {
    opacity: 0;
    transform: translateX(100%);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .word-card {
    border-width: 2px;
  }
  
  .action-btn {
    border: 1px solid var(--sw-gray-400);
  }
  
  .search-input {
    border-width: 2px;
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.background-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
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

.bg-circle-1 {
  top: 10%;
  left: 5%;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: float 4s ease-in-out infinite;
}

.bg-circle-2 {
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

/* 搜索卡片样式 */
.search-card {
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.search-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.search-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.search-card .card-header {
  padding: 1.5rem 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.search-card .card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-card .card-header h2 i {
  font-size: 1.2rem;
  color: #667eea;
  animation: pulse 2s infinite;
}

/* 搜索表单样式 */
.search-form {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.search-form:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.search-inline-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1.5rem;
}

.search-input {
  min-width: 250px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 2px solid #e1e5e9;
  box-shadow: none;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper):hover {
  border-color: #667eea;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-filter,
.search-sort {
  min-width: 150px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-filter :deep(.el-select__wrapper),
.search-sort :deep(.el-select__wrapper) {
  border-radius: 8px;
  border: 2px solid #e1e5e9;
  box-shadow: none;
  transition: all 0.3s ease;
}

.search-filter :deep(.el-select__wrapper):hover,
.search-sort :deep(.el-select__wrapper):hover {
  border-color: #667eea;
}

.search-filter :deep(.el-select__wrapper.is-focused),
.search-sort :deep(.el-select__wrapper.is-focused) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-btn,
.clear-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
  min-width: 100px;
  font-weight: 500;
}

.search-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.clear-btn {
  background: rgba(255, 255, 255, 0.8);
  color: #667eea;
  border: 2px solid #667eea;
}

.clear-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* 高级筛选样式 */
.advanced-filter {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid #f1f5f9;
  animation: slideDown 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.form-select,
.date-range-picker {
  width: 100%;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.form-select:focus,
.date-range-picker:focus {
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
  border-color: #4361ee;
}

.tag-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.filter-tag {
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 9999px;
}

.filter-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.filter-toggle {
  display: flex;
  justify-content: center;
}

.toggle-btn {
  color: #4361ee;
  transition: all 0.15s ease;
}

.toggle-btn:hover {
  transform: scale(1.05);
}

/* 搜索结果样式 */
.search-results {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  position: relative;
  animation: fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

/* 卡片标题样式 */
.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* 现代化单词卡片样式 */
.words-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--sw-space-6);
  min-width: 0;
  padding: var(--sw-space-4);
}

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--sw-space-4);
  width: 100%;
}

.skeleton-word-card {
  background: var(--sw-white);
  border-radius: var(--sw-radius-lg);
  padding: var(--sw-space-4);
  box-shadow: var(--sw-shadow-sm);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--sw-space-3);
}

.skeleton-title {
  width: 120px;
  height: 24px;
  background: var(--sw-gray-200);
  border-radius: var(--sw-radius-md);
}

.skeleton-actions {
  width: 80px;
  height: 32px;
  background: var(--sw-gray-200);
  border-radius: var(--sw-radius-md);
}

.skeleton-meta {
  width: 150px;
  height: 16px;
  background: var(--sw-gray-200);
  border-radius: var(--sw-radius-md);
  margin-bottom: var(--sw-space-3);
}

.skeleton-content {
  width: 100%;
  height: 40px;
  background: var(--sw-gray-200);
  border-radius: var(--sw-radius-md);
  margin-bottom: var(--sw-space-3);
}

.skeleton-tags {
  display: flex;
  gap: var(--sw-space-2);
}

.skeleton-tags::before,
.skeleton-tags::after {
  content: '';
  width: 60px;
  height: 24px;
  background: var(--sw-gray-200);
  border-radius: var(--sw-radius-full);
}

/* 空结果状态 */
.empty-results-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.empty-illustration {
  margin-bottom: var(--sw-space-6);
  color: var(--sw-gray-400);
}

.empty-results-container h3 {
  color: var(--sw-gray-700);
  margin-bottom: var(--sw-space-2);
}

.empty-results-container p {
  color: var(--sw-gray-500);
  margin-bottom: var(--sw-space-6);
}

.empty-actions {
  display: flex;
  gap: var(--sw-space-3);
}

/* 单词显示区域 */
.words-display {
  display: grid;
  gap: var(--sw-space-4);
}

.words-display.grid {
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

.words-display.list {
  grid-template-columns: 1fr;
}

/* 现代化单词卡片 */
.word-card-modern {
  background: var(--sw-white);
  border-radius: var(--sw-radius-lg);
  box-shadow: var(--sw-shadow-sm);
  transition: all var(--sw-transition-normal);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.word-card-modern:hover {
  box-shadow: var(--sw-shadow-md);
  transform: translateY(-2px);
}

.word-card-modern.selected {
  border: 2px solid var(--sw-primary);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.word-card-modern.batch-selected {
  background: var(--sw-primary-light);
  border: 2px solid var(--sw-primary);
}

/* 批量选择复选框 */
.batch-checkbox {
  position: absolute;
  top: var(--sw-space-3);
  left: var(--sw-space-3);
  z-index: 10;
}

.batch-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--sw-primary);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--sw-space-4) var(--sw-space-4) var(--sw-space-2);
}

.word-info {
  flex: 1;
}

.word-title {
  font-size: var(--sw-font-size-xl);
  font-weight: var(--sw-font-weight-semibold);
  color: var(--sw-gray-900);
  margin-bottom: var(--sw-space-1);
}

.word-phonetic {
  color: var(--sw-gray-500);
  font-size: var(--sw-font-size-sm);
  font-style: italic;
}

.card-actions {
  display: flex;
  gap: var(--sw-space-1);
}

.action-icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--sw-gray-400);
  border-radius: var(--sw-radius-md);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-icon-btn:hover {
  background: var(--sw-gray-100);
  color: var(--sw-gray-600);
}

/* 卡片内容 */
.card-content {
  padding: 0 var(--sw-space-4) var(--sw-space-4);
}

.word-meta {
  display: flex;
  gap: var(--sw-space-2);
  margin-bottom: var(--sw-space-3);
}

.part-of-speech-badge {
  padding: var(--sw-space-1) var(--sw-space-2);
  background: var(--sw-primary-light);
  color: var(--sw-primary-dark);
  border-radius: var(--sw-radius-md);
  font-size: var(--sw-font-size-xs);
  font-weight: var(--sw-font-weight-medium);
}

.date-badge {
  padding: var(--sw-space-1) var(--sw-space-2);
  background: var(--sw-gray-100);
  color: var(--sw-gray-600);
  border-radius: var(--sw-radius-md);
  font-size: var(--sw-font-size-xs);
}

.word-meaning {
  color: var(--sw-gray-700);
  line-height: 1.6;
  margin-bottom: var(--sw-space-3);
}

.word-tags {
  display: flex;
  gap: var(--sw-space-2);
  flex-wrap: wrap;
}

.word-tag {
  padding: var(--sw-space-1) var(--sw-space-2);
  background: var(--sw-gray-100);
  color: var(--sw-gray-600);
  border-radius: var(--sw-radius-full);
  font-size: var(--sw-font-size-xs);
}

.more-tags {
  padding: var(--sw-space-1) var(--sw-space-2);
  background: var(--sw-gray-200);
  color: var(--sw-gray-500);
  border-radius: var(--sw-radius-full);
  font-size: var(--sw-font-size-xs);
}

/* 展开的详细信息 */
.card-details {
  border-top: 1px solid var(--sw-gray-200);
  padding: var(--sw-space-4);
  background: var(--sw-gray-50);
}

.detail-item {
  margin-bottom: var(--sw-space-3);
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item h4 {
  color: var(--sw-gray-700);
  font-size: var(--sw-font-size-sm);
  font-weight: var(--sw-font-weight-semibold);
  margin-bottom: var(--sw-space-2);
}

.example-text {
  color: var(--sw-gray-600);
  font-style: italic;
  line-height: 1.6;
}

.detail-actions {
  display: flex;
  gap: var(--sw-space-2);
  margin-top: var(--sw-space-4);
  padding-top: var(--sw-space-3);
  border-top: 1px solid var(--sw-gray-200);
}

.detail-action-btn {
  display: flex;
  align-items: center;
  gap: var(--sw-space-1);
  padding: var(--sw-space-2) var(--sw-space-3);
  border: none;
  border-radius: var(--sw-radius-md);
  font-size: var(--sw-font-size-sm);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
}

.edit-btn {
  background: var(--sw-primary);
  color: var(--sw-white);
}

.edit-btn:hover {
  background: var(--sw-primary-dark);
}

.delete-btn {
  background: var(--sw-danger);
  color: var(--sw-white);
}

.delete-btn:hover {
  background: var(--sw-danger-dark);
}

/* 底部操作栏 */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--sw-white);
  border-top: 1px solid var(--sw-gray-200);
  padding: var(--sw-space-4);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.batch-info {
  color: var(--sw-gray-700);
  font-weight: var(--sw-font-weight-medium);
}

.batch-buttons {
  display: flex;
  gap: var(--sw-space-3);
}

.quick-stats {
  display: flex;
  justify-content: center;
  gap: var(--sw-space-8);
  max-width: 1200px;
  margin: 0 auto;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sw-space-1);
}

.stat-label {
  color: var(--sw-gray-500);
  font-size: var(--sw-font-size-sm);
}

.stat-value {
  color: var(--sw-gray-900);
  font-size: var(--sw-font-size-lg);
  font-weight: var(--sw-font-weight-semibold);
}

/* 浮动操作按钮 */
.floating-actions {
  position: fixed;
  bottom: var(--sw-space-6);
  right: var(--sw-space-6);
  display: flex;
  flex-direction: column;
  gap: var(--sw-space-3);
  z-index: 101;
}

.fab-btn {
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--sw-transition-fast);
  box-shadow: var(--sw-shadow-lg);
}

.fab-btn.primary {
  background: var(--sw-primary);
  color: var(--sw-white);
}

.fab-btn.primary:hover {
  background: var(--sw-primary-dark);
  transform: scale(1.05);
}

.fab-btn.secondary {
  background: var(--sw-white);
  color: var(--sw-gray-600);
  border: 1px solid var(--sw-gray-200);
}

.fab-btn.secondary:hover {
  background: var(--sw-gray-50);
  color: var(--sw-primary);
}

.fab-btn.secondary.active {
  background: var(--sw-primary);
  color: var(--sw-white);
  border-color: var(--sw-primary);
}

/* 现代化分页 */
.pagination-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sw-space-4);
  background: var(--sw-white);
  border-radius: var(--sw-radius-lg);
  box-shadow: var(--sw-shadow-sm);
  margin-top: var(--sw-space-4);
  margin-bottom: var(--sw-space-20); /* 为底部操作栏留空间 */
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: var(--sw-space-4);
}

.info-text {
  color: var(--sw-gray-600);
  font-size: var(--sw-font-size-sm);
}

.page-size-selector {
  padding: var(--sw-space-2) var(--sw-space-3);
  border: 1px solid var(--sw-gray-200);
  border-radius: var(--sw-radius-md);
  background: var(--sw-white);
  color: var(--sw-gray-700);
  font-size: var(--sw-font-size-sm);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--sw-space-2);
}

.pagination-btn {
  padding: var(--sw-space-2) var(--sw-space-3);
  border: 1px solid var(--sw-gray-200);
  background: var(--sw-white);
  color: var(--sw-gray-700);
  border-radius: var(--sw-radius-md);
  cursor: pointer;
  transition: all var(--sw-transition-fast);
  font-size: var(--sw-font-size-sm);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--sw-gray-50);
  border-color: var(--sw-gray-300);
}

.pagination-btn.active {
  background: var(--sw-primary);
  color: var(--sw-white);
  border-color: var(--sw-primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn {
  padding: var(--sw-space-2);
}

.page-numbers {
  display: flex;
  gap: var(--sw-space-1);
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  backdrop-filter: blur(10px);
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.search-card:hover .header-icon {
  transform: scale(1.05) rotate(5deg);
}

.gradient-text {
  background: linear-gradient(135deg, #4361ee, #4cc9f0);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
  margin: 0;
  position: relative;
}

.gradient-card {
  background: linear-gradient(135deg, #4361ee, #4cc9f0);
  color: white;
  border: none;
  border-radius: 1rem;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55),
    box-shadow 0.3s ease;
  animation: fadeInUp 0.6s cubic-bezier(0.215, 0.61, 0.355, 1);
}

.gradient-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 50%);
  pointer-events: none;
}

.gradient-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-loaded {
  animation: none;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e7ff;
}

.results-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-header h3 i {
  color: #4361ee;
}

.results-stats {
  font-size: 0.9rem;
  color: #6b7280;
}

.results-stats .highlight {
  color: #4361ee;
  font-weight: 600;
  font-size: 1.1rem;
}

.info-btn {
  margin-left: 0.75rem;
}

/* 搜索状态样式 */
.searching-state {
  padding: 1.5rem;
  background: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
}

/* 空结果样式 */
.empty-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  animation: fadeIn 0.5s cubic-bezier(0.215, 0.61, 0.355, 1);
  backdrop-filter: blur(5px);
}

.empty-icon {
  font-size: 3.5rem;
  color: #9ca3af;
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
  opacity: 0.7;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-results h4 {
  margin: 0 0 1rem;
  color: #111827;
  font-size: 1.2rem;
  font-weight: 600;
}

.empty-results p {
  margin: 0 0 1.5rem;
  color: #6b7280;
  line-height: 1.6;
}

/* 单词卡片样式 */
.word-card {
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  animation: fadeInUp 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.word-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
}

.word-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.word-card:hover::before {
  opacity: 1;
}

.word-card.highlight-card {
  border: 2px solid #667eea;
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.2);
}

.word-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.word-info {
  flex: 1;
}

.word-title {
  margin: 0 0 0.75rem;
  font-size: 1.3rem;
  font-weight: 600;
  color: #4361ee;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.word-title:hover {
  color: #4cc9f0;
}

.word-title i {
  color: #4cc9f0;
}

.phonetic {
  font-size: 0.9rem;
  color: #6b7280;
  font-style: italic;
  margin-left: 0.75rem;
}

.pronounce-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.pronounce-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.word-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.part-of-speech {
  font-size: 0.8rem;
  padding: 2px 8px;
  background: #f0f4ff;
  border-radius: 9999px;
  color: #4361ee;
  font-weight: 500;
}

.date {
  font-size: 0.8rem;
  color: #6b7280;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.word-tag {
  font-size: 0.75rem;
  border-radius: 9999px;
  transition: all 0.15s ease;
}

.word-meaning {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  line-height: 1.6;
  color: #111827;
}

/* 单词详情样式 */
.word-details {
  padding: 1rem 0;
  border-top: 1px solid #f1f5f9;
}

.example-section,
.synonyms-section {
  margin-bottom: 1rem;
}

.example-section h4,
.synonyms-section h4 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 6px;
}

.example-section h4 i,
.synonyms-section h4 i {
  color: #4361ee;
  font-size: 0.9rem;
}

.example-text {
  font-style: italic;
  color: #6b7280;
  line-height: 1.6;
  padding-left: 1rem;
  border-left: 3px solid #e0e7ff;
}

/* 单词操作按钮 */
.word-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 1rem;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #e0e7ff;
  background: #fff;
  color: #667eea;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.action-btn:hover {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.action-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.15);
}

.action-btn.delete:hover {
  background: linear-gradient(135deg, #f56565, #ed8936);
  border-color: #f56565;
}

.detail-toggle {
  color: #4361ee;
  transition: all 0.15s ease;
}

.detail-toggle:hover {
  transform: scale(1.05);
}

.delete-btn {
  color: white;
  transition: all 0.15s ease;
}

.delete-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(247, 37, 133, 0.3);
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 2rem;
}

.pagination button {
  min-width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #e0e7ff;
  background: #fff;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-weight: 500;
}

.pagination button:hover:not(:disabled) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.pagination button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.15);
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f7fafc;
}

.pagination button.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.pagination .page-info {
  padding: 0 16px;
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
}

/* 删除确认对话框 */
.delete-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.delete-content {
  background: #fff;
  border-radius: 15px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  animation: slideDown 0.3s ease;
}

.delete-content h3 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.delete-content p {
  color: #4a5568;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.delete-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.delete-buttons button {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 100px;
}

.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.cancel-btn:hover {
  background: #edf2f7;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.confirm-btn {
  background: linear-gradient(135deg, #f56565, #ed8936);
  color: #fff;
  box-shadow: 0 4px 12px rgba(245, 101, 101, 0.2);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 101, 101, 0.3);
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

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    max-height: 500px;
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

/* 过渡动画 */
.detail-fade-enter-active,
.detail-fade-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.detail-fade-enter-from,
.detail-fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.detail-fade-enter-to,
.detail-fade-leave-from {
  opacity: 1;
  max-height: 500px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .search-words-container {
    padding: 1rem;
  }
  
  .search-card {
    padding: 1.5rem;
  }
  
  .word-card {
    padding: 1rem;
  }
  
  .search-inline-form {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input,
  .search-filter,
  .search-sort {
    width: 100%;
    min-width: auto;
  }
  
  .results-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .search-words-container {
    padding: 0.75rem;
    gap: 1.5rem;
  }
  
  .search-card {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .search-card .card-header h2 {
    font-size: 1.3rem;
  }
  
  .search-form {
    padding: 1rem;
    gap: 12px;
  }
  
  .search-input {
    min-width: 0;
  }
  
  .advanced-filter {
    padding: 1rem;
  }
  
  .word-card {
    padding: 0.75rem;
  }
  
  .word-card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .delete-btn {
    align-self: flex-end;
  }
  
  .word-title {
    font-size: 1.2rem;
  }
  
  .pagination {
    gap: 6px;
  }
  
  .pagination button {
    min-width: 36px;
    height: 36px;
    font-size: 14px;
  }
  
  .delete-dialog {
    width: 80% !important;
  }
}

@media (max-width: 480px) {
  .search-words-container {
    padding: 0.5rem;
  }
  
  .search-card {
    padding: 0.75rem;
  }
  
  .search-form {
    padding: 0.75rem;
    gap: 8px;
  }
  
  .advanced-filter {
    padding: 0.75rem;
  }
  
  .word-card {
    padding: 0.5rem;
  }
  
  .word-meaning {
    padding: 0.75rem;
  }
  
  .word-title {
    font-size: 1.1rem;
  }
  
  .results-header h3 {
    font-size: 1.1rem;
  }
  
  .empty-icon {
    font-size: 2rem;
  }
  
  .delete-icon {
    font-size: 2rem;
  }
  
  .pagination {
    gap: 4px;
  }
  
  .pagination button {
    min-width: 32px;
    height: 32px;
    font-size: 12px;
  }
  
  .pagination .page-info {
    font-size: 12px;
    padding: 0 8px;
  }
  
  .delete-content {
    padding: 1rem;
    margin: 1rem;
  }
  
  .delete-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .delete-buttons button {
    width: 100%;
  }
}

/* 滚动条样式 */
:deep(.el-select-dropdown__wrap) {
  max-height: 250px;
}

/* 输入框聚焦动画 */
.search-input,
.search-filter,
.search-sort {
  position: relative;
  overflow: hidden;
}

.search-input:focus::after,
.search-filter:focus::after,
.search-sort:focus::after {
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