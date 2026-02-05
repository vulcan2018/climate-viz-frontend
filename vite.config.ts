import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react(), cesium()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          cesium: ['cesium', 'resium'],
          deckgl: ['@deck.gl/core', '@deck.gl/layers', '@deck.gl/react'],
          charts: ['recharts', 'd3-scale', 'd3-scale-chromatic'],
        },
      },
    },
  },
});
