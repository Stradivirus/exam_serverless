import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: 'https://storage.googleapis.com/exam-serverless-storage/',  // 버킷 루트 URL로 설정
  build: {
    sourcemap: false
  }
})