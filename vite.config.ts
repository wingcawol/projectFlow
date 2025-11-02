import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // FIX: `__dirname` is not available in ES modules. Using `import.meta.url` to create an absolute path for the '@' alias.
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
