import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // BARIS INI ADALAH SOLUSINYA: Tambahkan base path
  base: '/Family-Budgeting-Apps/', 
  plugins: [react()],
})