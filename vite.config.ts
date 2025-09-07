import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Custom plugin to fix MIME type issues
const mimeTypePlugin: Plugin = {
  name: 'mime-type-fix',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url?.endsWith('.tsx') || req.url?.endsWith('.ts') || req.url?.endsWith('.jsx') || req.url?.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      next();
    });
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    mimeTypePlugin,
    react({
      include: '**/*.{jsx,tsx}',
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/stores': path.resolve(__dirname, './src/stores'),
    },
  },
  server: {
    port: 3001,
    open: true,
    fs: {
      strict: false,
    },
    hmr: {
      overlay: false,
    },
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
    middlewareMode: false,
    cors: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['chart.js', 'react-chartjs-2', 'react-table'],
        },
      },
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
    exclude: ['@vite/client', '@vite/env'],
  },
  esbuild: {
    target: 'es2020',
    define: {
      global: 'globalThis',
    },
  },
})