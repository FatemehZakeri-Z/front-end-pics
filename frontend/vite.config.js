import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The API is proxied through the dev server so the browser talks to a single
// origin — that keeps the cookie session (and the cart tied to it) working.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
