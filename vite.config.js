import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    vueDevTools(),
    quasar()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      // 백엔드 API 요청에 대한 프록시 설정
      '/api': {
        target: 'http://localhost:8080', // 실제 백엔드 서버 주소
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // '/api'를 제거하고 백엔드에 전달
      }
    }
  }
})
