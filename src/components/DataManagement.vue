<template>
  <div class="data-management">
    <!-- 背景装饰元素 -->
    <div class="background-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-gradient"></div>
    </div>
    
    <h2 class="page-title">数据管理</h2>
    
    <el-card class="data-card">
      <template #header>
        <div class="card-header">
          <span>数据备份与恢复</span>
        </div>
      </template>
      
      <div class="action-buttons">
        <el-button type="primary" @click="exportData" :loading="exporting">
          <i class="fa fa-download"></i> 导出数据
        </el-button>
        
        <el-button type="success" @click="triggerImport" :loading="importing">
          <i class="fa fa-upload"></i> 导入数据
        </el-button>
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          accept=".json"
          @change="handleFileUpload"
        />
      </div>
      
      <div class="stats" v-if="lastBackup">
        <p>上次备份时间: {{ formatDate(lastBackup) }}</p>
      </div>
    </el-card>
    
    <el-dialog
      v-model="showImportDialog"
      title="导入数据"
      width="30%"
    >
      <span>确定要导入数据吗？这将覆盖当前的数据。</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showImportDialog = false">取消</el-button>
          <el-button type="primary" @click="confirmImport" :loading="importing">
            确认导入
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useWordStore } from '../stores/wordStore';
import { ElMessage, ElDialog } from 'element-plus';

export default {
  name: 'DataManagement',
  
  setup() {
    const wordStore = useWordStore();
    const fileInput = ref(null);
    const exporting = ref(false);
    const importing = ref(false);
    const importFile = ref(null);
    const showImportDialog = ref(false);
    const lastBackup = ref(localStorage.getItem('lastBackup'));
    
    // 导出数据
    const exportData = async () => {
      try {
        exporting.value = true;
        const data = await wordStore.exportData();
        
        if (!data) {
          ElMessage.error('导出数据失败');
          return;
        }
        
        // 创建下载链接
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        // 创建下载链接并点击
        const link = document.createElement('a');
        link.href = url;
        const date = new Date().toISOString().split('T')[0];
        link.download = `english_diary_backup_${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 记录备份时间
        const now = new Date().toISOString();
        localStorage.setItem('lastBackup', now);
        lastBackup.value = now;
        
        ElMessage.success('数据导出成功');
      } catch (error) {
        console.error('Error exporting data:', error);
        ElMessage.error('导出数据时发生错误');
      } finally {
        exporting.value = false;
      }
    };
    
    // 触发文件选择
    const triggerImport = () => {
      fileInput.value.click();
    };
    
    // 处理文件上传
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      
      // 检查文件类型
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        ElMessage.error('请上传JSON格式的文件');
        return;
      }
      
      importFile.value = file;
      showImportDialog.value = true;
    };
    
    // 确认导入
    const confirmImport = async () => {
      if (!importFile.value) return;
      
      try {
        importing.value = true;
        
        // 读取文件内容
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target.result);
            
            // 验证数据格式
            if (!data.words || !Array.isArray(data.words)) {
              ElMessage.error('无效的数据格式');
              importing.value = false;
              return;
            }
            
            // 导入数据
            console.log('开始导入数据，单词数量:', data.words.length);
            const success = await wordStore.importData(data);
            
            if (success) {
              ElMessage.success(`数据导入成功，共导入 ${data.words.length} 个单词`);
              showImportDialog.value = false;
              
              // 验证导入结果
              await wordStore.loadFromDB();
              console.log('导入验证 - 当前store中单词数量:', wordStore.words.length);
              
              // 检查导入的单词日期分布
              const dateStats = {};
              wordStore.words.forEach(word => {
                const date = word.date || 'unknown';
                dateStats[date] = (dateStats[date] || 0) + 1;
              });
              console.log('导入后的日期分布:', dateStats);
              
              // 触发全局事件通知其他组件刷新
              window.dispatchEvent(new CustomEvent('dataImported', { 
                detail: { 
                  wordsCount: data.words.length,
                  totalWords: wordStore.words.length,
                  dateStats: dateStats,
                  timestamp: new Date().toISOString()
                } 
              }));
              
              // 延迟再次触发确保组件收到通知
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('dataImported', { 
                  detail: { 
                    wordsCount: data.words.length,
                    totalWords: wordStore.words.length,
                    dateStats: dateStats,
                    timestamp: new Date().toISOString()
                  } 
                }));
              }, 300);
            } else {
              ElMessage.error('导入数据失败');
            }
          } catch (error) {
            console.error('Error parsing import file:', error);
            ElMessage.error('解析导入文件时发生错误');
          } finally {
            importing.value = false;
          }
        };
        
        reader.onerror = () => {
          ElMessage.error('读取文件时发生错误');
          importing.value = false;
        };
        
        reader.readAsText(importFile.value);
      } catch (error) {
        console.error('Error importing data:', error);
        ElMessage.error('导入数据时发生错误');
        importing.value = false;
      }
    };
    
    // 格式化日期
    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleString();
    };
    
    return {
      fileInput,
      exporting,
      importing,
      showImportDialog,
      lastBackup,
      exportData,
      triggerImport,
      handleFileUpload,
      confirmImport,
      formatDate
    };
  }
};
</script>

<style scoped>
.data-management {
  min-height: 100vh;
  padding: 1rem;
  position: relative;
  overflow: hidden;
}

/* 背景装饰元素 */
.background-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: -1;
}

.background-decoration::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
  opacity: 0.05;
  animation: float 20s ease-in-out infinite;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: float 6s ease-in-out infinite;
}

.bg-circle-1 {
  top: 10%;
  right: 10%;
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.15;
  animation-delay: 0s;
}

.bg-circle-2 {
  bottom: 20%;
  left: 5%;
  width: 150px;
  height: 150px;
  background: linear-gradient(135deg, #ed8936 0%, #f56565 100%);
  opacity: 0.1;
  animation-delay: 2s;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

/* 页面标题 */
.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

/* 主卡片样式 */
.data-card {
  max-width: 600px;
  margin: 0 auto 1rem;
  background: #fff;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.data-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: all 0.3s ease;
}

.data-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

.data-card:hover::before {
  height: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #2d3748;
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-buttons .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-buttons .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.action-buttons .el-button--success {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  border: none;
}

.stats {
  margin-top: 15px;
  padding: 12px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border-left: 4px solid #667eea;
  color: #4a5568;
  font-size: 0.9rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-management {
    padding: 0.75rem;
  }
  
  .page-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .data-card {
    margin-bottom: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .data-management {
    padding: 0.5rem;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .bg-circle-1 {
    width: 120px;
    height: 120px;
  }
  
  .bg-circle-2 {
    width: 80px;
    height: 80px;
  }
}
</style>