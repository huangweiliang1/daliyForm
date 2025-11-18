import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // 确保环境变量可用
  define: {
    'process.env': {
      NODE_ENV: process.env.NODE_ENV || 'development'
    },
    // 确保 import.meta.env 可用
    'import.meta.env': {
      DEV: process.env.NODE_ENV === 'development',
      PROD: process.env.NODE_ENV === 'production',
      MODE: process.env.NODE_ENV || 'development'
    }
  },
  base: '/daliyForme/', // 这应该与您的GitHub仓库名称完全匹配
  plugins: [
    vue(),
    // 启用 gzip 压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // 构建分析
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // PWA 支持
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: '英语学习日记',
        short_name: '英语日记',
        description: '记录英语学习和日常',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        start_url: '/daliyForme/',
        display: 'standalone',
        background_color: '#ffffff'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg}'],
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 年
              }
            }
          }
        ]
      }
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // 代码分割策略
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 相关库打包在一起
          'vue-vendor': ['vue', 'vue-router'],
          // 将 Element Plus 单独打包
          'element-plus-vendor': ['element-plus'],
          // 将工具库打包在一起
          'utils-vendor': ['idb'],
        },
        // 静态资源分类打包
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 启用最小化混淆
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境去除 console
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 设置 chunk 大小警告阈值
    chunkSizeWarningLimit: 1000,
  }
})