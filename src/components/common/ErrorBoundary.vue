<template>
  <div v-if="hasError" class="error-boundary">
    <el-result
      icon="error"
      title="出错了"
      :sub-title="errorMessage || '应用遇到了一个问题'"
    >
      <template #extra>
        <el-button type="primary" @click="resetError">重试</el-button>
      </template>
    </el-result>
  </div>
  <slot v-else></slot>
</template>

<script>
export default {
  name: 'ErrorBoundary',
  props: {
    fallback: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      hasError: false,
      errorMessage: ''
    }
  },
  methods: {
    resetError() {
      this.hasError = false
      this.errorMessage = ''
    }
  },
  errorCaptured(err, vm, info) {
    this.hasError = true
    this.errorMessage = err.message || '未知错误'
    
    console.error('ErrorBoundary捕获到错误:', {
      error: err,
      component: vm?.$options?.name || '未知组件',
      info
    })
    
    // 如果提供了自定义回调，则调用
    if (this.fallback) {
      this.fallback(err, vm, info)
    }
    
    // 阻止错误继续传播
    return false
  }
}
</script>

<style scoped>
.error-boundary {
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
</style>