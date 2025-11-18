import { defineStore } from 'pinia';
import { openDB } from 'idb';
import { wordDB, diaryDB, dataExport, initializeFromLocalStorage } from '../services/db';

export const useWordStore = defineStore('word', {
  state: () => ({
    words: [],
    diaries: [],
    lastUpdated: null,
    isLoading: false,
    initialized: false
  }),
  
  getters: {
    totalWords: (state) => state.words.length,
    
    todayWords: (state) => {
      const today = new Date().toISOString().split('T')[0];
      return state.words.filter(word => word.date === today).length;
    },
    
    studyDays: (state) => {
      const uniqueDates = new Set(state.words.map(word => word.date));
      return uniqueDates.size;
    },
    
    getWordsByDate: (state) => (date) => {
      if (!date) return state.words;
      return state.words.filter(word => word.date === date);
    },
    
    getDiaries: (state) => state.diaries,
    
    getDiaryByDate: (state) => (date) => {
      return state.diaries.find(diary => diary.date === date);
    }
  },
  
  actions: {
    // 初始化方法
    async initialize() {
      if (this.initialized || this.isLoading) {
        return;
      }
      
      this.isLoading = true;
      try {
        // 检查是否支持IndexedDB
        if (!window.indexedDB) {
          console.warn('IndexedDB not supported, falling back to localStorage');
          this.loadFromLocalStorage();
          this.initialized = true;
          return;
        }
        
        // 首次使用时，从localStorage导入数据到IndexedDB
        await initializeFromLocalStorage();
        
        // 从IndexedDB加载数据
        await this.loadFromDB();
        this.initialized = true;
      } catch (error) {
        console.error('Error initializing store:', error);
        // 如果IndexedDB失败，回退到localStorage
        try {
          this.loadFromLocalStorage();
          this.initialized = true;
        } catch (fallbackError) {
          console.error('Fallback to localStorage also failed:', fallbackError);
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    // 从IndexedDB加载数据
    async loadFromDB() {
      try {
        this.isLoading = true;
        this.words = await wordDB.getAll();
        this.diaries = await diaryDB.getAll();
        this.lastUpdated = new Date();
      } catch (error) {
        console.error('Error loading data from IndexedDB:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 添加单词
    async addWord(word) {
      if (!word.id) {
        word.id = Date.now().toString();
      }
      if (!word.date) {
        word.date = new Date().toISOString().split('T')[0];
      }
      
      try {
        await wordDB.add(word);
        this.words.push(word);
        this.lastUpdated = new Date();
        
        // 同时保存到localStorage作为备份
        this.saveToLocalStorage();
        
        return word;
      } catch (error) {
        console.error('Error adding word:', error);
        throw error;
      }
    },
    
    // 更新单词
    async updateWord(updatedWord) {
      try {
        await wordDB.update(updatedWord);
        const index = this.words.findIndex(w => w.id === updatedWord.id);
        if (index !== -1) {
          this.words[index] = { ...this.words[index], ...updatedWord };
          this.lastUpdated = new Date();
          
          // 同时更新localStorage备份
          this.saveToLocalStorage();
          
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error updating word:', error);
        throw error;
      }
    },
    
    // 删除单词
    async deleteWord(wordId) {
      try {
        await wordDB.delete(wordId);
        const index = this.words.findIndex(w => w.id === wordId);
        if (index !== -1) {
          this.words.splice(index, 1);
          this.lastUpdated = new Date();
          
          // 同时更新localStorage备份
          this.saveToLocalStorage();
          
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error deleting word:', error);
        throw error;
      }
    },
    
    // 添加或更新日记
    async addDiary(diary) {
      if (!diary.date) {
        diary.date = new Date().toISOString().split('T')[0];
      }
      
      try {
        await diaryDB.save(diary);
        
        const existingIndex = this.diaries.findIndex(d => d.date === diary.date);
        if (existingIndex !== -1) {
          this.diaries[existingIndex] = diary;
        } else {
          this.diaries.push(diary);
        }
        
        this.lastUpdated = new Date();
      } catch (error) {
        console.error('Error saving diary:', error);
      }
    },
    
    // 兼容性方法 - 从localStorage加载数据
    loadFromLocalStorage() {
      try {
        const wordsData = localStorage.getItem('words');
        if (wordsData) {
          this.words = JSON.parse(wordsData);
        }
        this.lastUpdated = new Date();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    },
    
    // 兼容性方法 - 保存到localStorage
    saveToLocalStorage() {
      try {
        localStorage.setItem('words', JSON.stringify(this.words));
        this.lastUpdated = new Date();
      } catch (error) {
        console.error('Error saving data:', error);
      }
    },
    
    // 导出数据
    async exportData() {
      try {
        return await dataExport.exportAll();
      } catch (error) {
        console.error('Error exporting data:', error);
        return {
          words: this.words,
          exportDate: new Date().toISOString()
        };
      }
    },
    
    // 导入数据
    async importData(data) {
      if (!data || !data.words) {
        return false;
      }
      
      try {
        console.log('开始导入数据，单词数量:', data.words.length);
        
        // 确保每个导入的单词都有必要的字段
        const processedWords = data.words.map(word => {
          // 确保有id
          if (!word.id) {
            word.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          }
          
          // 确保有日期，如果没有则使用今天
          if (!word.date) {
            word.date = new Date().toISOString().split('T')[0];
          } else {
            // 标准化日期格式
            try {
              const dateObj = new Date(word.date);
              word.date = dateObj.toISOString().split('T')[0];
            } catch (error) {
              console.warn('日期格式错误，使用今天日期:', word.date);
              word.date = new Date().toISOString().split('T')[0];
            }
          }
          
          return word;
        });
        
        const success = await dataExport.importData({ ...data, words: processedWords });
        
        if (success) {
          console.log('数据导入成功，重新加载数据...');
          
          // 重新从数据库加载数据
          await this.loadFromDB();
          
          // 同时更新localStorage备份
          this.saveToLocalStorage();
          
          console.log('数据重新加载完成，当前单词数量:', this.words.length);
        }
        
        return success;
      } catch (error) {
        console.error('Error importing data:', error);
        
        // 回退到原始方法
        try {
          if (data.words) {
            // 处理数据
            const processedWords = data.words.map(word => {
              if (!word.id) {
                word.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
              }
              if (!word.date) {
                word.date = new Date().toISOString().split('T')[0];
              }
              return word;
            });
            
            this.words = processedWords;
            this.saveToLocalStorage();
            console.log('使用备用方法导入成功，单词数量:', this.words.length);
            return true;
          }
        } catch (fallbackError) {
          console.error('备用导入方法也失败:', fallbackError);
        }
        
        return false;
      }
    },
    
    // 清空所有数据
    async clearAllData() {
      try {
        this.isLoading = true;
        
        // 清空IndexedDB中的数据
        const db = await openDB('english_diary_db', 1);
        
        // 清空单词表
        const wordsTx = db.transaction('words', 'readwrite');
        await wordsTx.objectStore('words').clear();
        await wordsTx.done;
        
        // 清空日记表
        const diariesTx = db.transaction('diaries', 'readwrite');
        await diariesTx.objectStore('diaries').clear();
        await diariesTx.done;
        
        // 清空store中的数据
        this.words = [];
        this.diaries = [];
        this.lastUpdated = new Date();
        
        // 清空localStorage中的备份
        localStorage.removeItem('words');
        localStorage.removeItem('diaries');
        
        return true;
      } catch (error) {
        console.error('Error clearing all data:', error);
        return false;
      } finally {
        this.isLoading = false;
      }
    }
  }
})