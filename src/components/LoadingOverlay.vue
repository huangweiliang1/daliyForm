<template>
  <transition name="fade">
    <div v-if="visible" class="loading-overlay">
      <el-icon class="loading-icon" :size="40"><Loading /></el-icon>
      <p class="loading-text">{{ text || '加载中...' }}</p>
    </div>
  </transition>
</template>

<script setup>
import { Loading } from '@element-plus/icons-vue'

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-icon {
  color: #409eff;
  animation: rotate 1.5s linear infinite;
}

.loading-text {
  margin-top: 15px;
  color: #606266;
  font-size: 16px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>