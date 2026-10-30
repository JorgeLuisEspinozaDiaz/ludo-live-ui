import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// React Compiler desactivado temporalmente: interfería con setState async en hooks de listados.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
