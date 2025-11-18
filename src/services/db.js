import { openDB } from 'idb';

const DB_NAME = 'english_diary_db';
const DB_VERSION = 1;
const WORDS_STORE = 'words';
const DIARIES_STORE = 'diaries';

// 初始化数据库
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 创建单词存储
      if (!db.objectStoreNames.contains(WORDS_STORE)) {
        const wordStore = db.createObjectStore(WORDS_STORE, { keyPath: 'id' });
        wordStore.createIndex('date', 'date', { unique: false });
      }
      
      // 创建日记存储
      if (!db.objectStoreNames.contains(DIARIES_STORE)) {
        const diaryStore = db.createObjectStore(DIARIES_STORE, { keyPath: 'date' });
      }
    }
  });
}

// 获取数据库实例
let dbPromise;
function getDB() {
  if (!dbPromise) {
    dbPromise = initDB();
  }
  return dbPromise;
}

// 单词相关操作
export const wordDB = {
  // 获取所有单词
  async getAll() {
    const db = await getDB();
    return db.getAll(WORDS_STORE);
  },
  
  // 按日期获取单词
  async getByDate(date) {
    const db = await getDB();
    const tx = db.transaction(WORDS_STORE, 'readonly');
    const index = tx.store.index('date');
    return index.getAll(date);
  },
  
  // 添加单词
  async add(word) {
    if (!word.id) {
      word.id = Date.now().toString();
    }
    if (!word.date) {
      word.date = new Date().toISOString().split('T')[0];
    }
    const db = await getDB();
    return db.add(WORDS_STORE, word);
  },
  
  // 更新单词
  async update(word) {
    const db = await getDB();
    return db.put(WORDS_STORE, word);
  },
  
  // 删除单词
  async delete(id) {
    const db = await getDB();
    return db.delete(WORDS_STORE, id);
  },
  
  // 从localStorage导入数据
  async importFromLocalStorage() {
    try {
      const wordsData = localStorage.getItem('words');
      if (wordsData) {
        const words = JSON.parse(wordsData);
        const db = await getDB();
        const tx = db.transaction(WORDS_STORE, 'readwrite');
        for (const word of words) {
          await tx.store.put(word);
        }
        await tx.done;
        return true;
      }
    } catch (error) {
      console.error('Error importing from localStorage:', error);
    }
    return false;
  }
};

// 日记相关操作
export const diaryDB = {
  // 获取所有日记
  async getAll() {
    const db = await getDB();
    return db.getAll(DIARIES_STORE);
  },
  
  // 获取指定日期的日记
  async getByDate(date) {
    const db = await getDB();
    return db.get(DIARIES_STORE, date);
  },
  
  // 添加或更新日记
  async save(diary) {
    if (!diary.date) {
      diary.date = new Date().toISOString().split('T')[0];
    }
    const db = await getDB();
    return db.put(DIARIES_STORE, diary);
  },
  
  // 删除日记
  async delete(date) {
    const db = await getDB();
    return db.delete(DIARIES_STORE, date);
  },
  
  // 从localStorage导入数据
  async importFromLocalStorage() {
    try {
      const diariesData = localStorage.getItem('diaries');
      if (diariesData) {
        const diaries = JSON.parse(diariesData);
        const db = await getDB();
        const tx = db.transaction(DIARIES_STORE, 'readwrite');
        for (const diary of diaries) {
          await tx.store.put(diary);
        }
        await tx.done;
        return true;
      }
    } catch (error) {
      console.error('Error importing from localStorage:', error);
    }
    return false;
  }
};

// 导出/导入功能
export const dataExport = {
  // 导出所有数据
  async exportAll() {
    try {
      const words = await wordDB.getAll();
      const diaries = await diaryDB.getAll();
      
      return {
        words,
        diaries,
        exportDate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  },
  
  // 导入数据
  async importData(data) {
    try {
      if (!data || (!data.words && !data.diaries)) {
        return false;
      }
      
      const db = await getDB();
      
      if (data.words && data.words.length > 0) {
        const wordsTx = db.transaction(WORDS_STORE, 'readwrite');
        for (const word of data.words) {
          await wordsTx.store.put(word);
        }
        await wordsTx.done;
      }
      
      if (data.diaries && data.diaries.length > 0) {
        const diariesTx = db.transaction(DIARIES_STORE, 'readwrite');
        for (const diary of data.diaries) {
          await diariesTx.store.put(diary);
        }
        await diariesTx.done;
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
};

// 初始化函数 - 从localStorage导入数据到IndexedDB
export async function initializeFromLocalStorage() {
  await wordDB.importFromLocalStorage();
  await diaryDB.importFromLocalStorage();
}