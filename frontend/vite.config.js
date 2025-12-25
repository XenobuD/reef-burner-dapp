import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// V1 config that WORKS on production (Reef Layer 1)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  define: {
    'process.env': {},
    global: 'globalThis'
  }
});
