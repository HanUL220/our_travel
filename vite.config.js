import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 상대 경로로 설정하여 커스텀 도메인(our-travel.kro.kr) 및 GitHub Pages 모두 지원
})
