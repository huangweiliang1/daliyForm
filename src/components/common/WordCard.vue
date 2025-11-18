<template>
  <div class="word-card" :class="[viewMode, { 'word-card-error': !word || !word.word }]">
    <!-- 错误状态 -->
    <div v-if="!word || !word.word" class="error-state">
      <div class="error-message">
        <i class="fas fa-exclamation-circle error-icon"></i>
        单词数据不完整或损坏
      </div>
    </div>
    
    <!-- 正常状态 -->
    <div v-else class="card-content">
      <!-- 卡片头部 -->
      <div class="card-header">
        <div class="word-info">
          <h3 class="word-title">{{ word.word }}</h3>
          <div class="word-meta">
            <span class="word-date">
              <i class="fas fa-calendar-alt"></i>
              {{ formatDate(word.date) }}
            </span>
          </div>
        </div>
        <div class="word-actions" v-if="showActions">
          <button class="action-btn edit-btn" @click="$emit('edit', word)">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-btn delete-btn" @click="$emit('delete', word)">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
      
      <!-- 卡片内容 -->
      <div class="card-body">
        <div class="word-meaning">
          <div class="meaning-label">释义</div>
          <div class="meaning-text">{{ word.meaning || '暂无释义' }}</div>
        </div>
        
        <div v-if="word.example" class="word-example">
          <div class="example-label">例句</div>
          <div class="example-text">{{ word.example }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  word: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  viewMode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value)
  }
})

defineEmits(['edit', 'delete'])

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.word-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  margin-bottom: 15px;
}

.word-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.word-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.word-card:hover::before {
  opacity: 1;
}

.word-card.list {
  display: flex;
  align-items: center;
  padding: 20px;
}

.word-card.list .card-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 30px;
}

.word-card.list .word-info {
  flex: 1;
}

.word-card.list .card-header {
  margin-bottom: 8px;
}

.word-card.list .word-title {
  font-size: 20px;
}

.word-card.list .word-date {
  font-size: 14px;
}

.word-card.list .word-meaning {
  font-size: 15px;
  margin-bottom: 6px;
}

.word-card.list .word-example {
  font-size: 14px;
}

.word-card.list .word-actions {
  flex-shrink: 0;
}

.error-state {
  padding: 20px;
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #fecaca;
}

.error-icon {
  font-size: 16px;
}

.word-card-error {
  margin-bottom: 15px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.word-title {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.word-date {
  font-size: 13px;
  color: #a0aec0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.word-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.edit-btn {
  background: #edf2f7;
  color: #4a5568;
}

.edit-btn:hover {
  background: #667eea;
  color: white;
  transform: scale(1.05);
}

.delete-btn {
  background: #fed7d7;
  color: #c53030;
}

.delete-btn:hover {
  background: #fc8181;
  color: white;
  transform: scale(1.05);
}

.word-info {
  margin-bottom: 16px;
}

.word-meaning {
  font-size: 16px;
  color: #4a5568;
  margin-bottom: 12px;
  line-height: 1.5;
  padding: 12px 16px;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.word-example {
  font-size: 15px;
  color: #718096;
  line-height: 1.6;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f6f9fc 0%, #e9f3ff 100%);
  border-radius: 8px;
  position: relative;
}

.word-example::before {
  content: '"';
  position: absolute;
  top: 8px;
  left: 12px;
  font-size: 24px;
  color: #cbd5e0;
  font-family: Georgia, serif;
}

.example-text {
  position: relative;
  z-index: 1;
  font-style: italic;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .word-card {
    padding: 20px;
  }
  
  .word-card.list {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .word-card.list .card-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    width: 100%;
  }
  
  .word-card.list .word-actions {
    align-self: flex-end;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .word-actions {
    align-self: flex-end;
  }
  
  .word-title {
    font-size: 20px;
  }
  
  .word-meaning {
    padding: 10px 12px;
    font-size: 15px;
  }
  
  .word-example {
    padding: 10px 12px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .word-card {
    padding: 16px;
  }
  
  .word-title {
    font-size: 18px;
  }
  
  .word-meaning {
    padding: 10px 12px;
    font-size: 14px;
  }
  
  .word-example {
    padding: 10px 12px;
    font-size: 13px;
  }
}

/* 动画效果 */
.word-card {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>