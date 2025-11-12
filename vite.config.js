import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost',
        changeOrigin: true,
        rewrite: (path) => {
          // Преобразуем /api/admin-auth.php в /cat-club/src/api/admin-auth.php
          const apiPath = path.replace(/^\/api\//, '');
          return `/cat-club/src/api/${apiPath}`;
        },
      },
    },
  },
})
