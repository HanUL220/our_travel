import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/our_travel/', // GitHub Pages 저장소 이름에 맞춘 base 경로
})
