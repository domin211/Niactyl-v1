import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { API_BASE_URL } from './src/config';

export default defineConfig({
  plugins: [react()],
  root: './src',
  server: {
    proxy: {
      '/api': API_BASE_URL
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  css: {
    postcss: './postcss.config.js',
  }
});