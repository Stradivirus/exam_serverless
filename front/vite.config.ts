import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/dist/',  // './' 대신 '/dist/'로 수정
  build: {
    assetsDir: 'assets',
    outDir: 'dist'
  }
})