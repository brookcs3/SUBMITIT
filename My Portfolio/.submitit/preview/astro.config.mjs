
import { defineConfig } from 'astro/config';

export default defineConfig({
  srcDir: './src',
  publicDir: './public',
  outDir: './dist',
  server: {
    port: 4321,
    host: true
  },
  build: {
    assets: 'assets'
  },
  vite: {
    server: {
      watch: {
        usePolling: true
      }
    }
  }
});