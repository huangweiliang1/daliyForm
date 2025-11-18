<template>
  <el-card class="stats-panel" shadow="hover">
    <template #header>
      <div class="stats-header">
        <h3>{{ title }}</h3>
        <el-button v-if="showRefresh" type="primary" size="small" @click="$emit('refresh')">
          刷新
        </el-button>
      </div>
    </template>
    
    <div class="stats-content">
      <div v-for="(item, index) in stats" :key="index" class="stats-item">
        <div class="stats-label">{{ item.label }}</div>
        <div class="stats-value" :class="item.highlight ? 'highlight' : ''">
          {{ item.value }}
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: '统计数据'
  },
  stats: {
    type: Array,
    required: true
  },
  showRefresh: {
    type: Boolean,
    default: false
  }
})

defineEmits(['refresh'])
</script>

<style scoped>
.stats-panel {
  margin-bottom: 20px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.stats-content {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stats-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stats-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stats-value.highlight {
  color: #409EFF;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .stats-content {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>