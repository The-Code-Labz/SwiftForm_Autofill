import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './',
  base: './',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        settings: resolve(__dirname, 'settings.html'),
        profile: resolve(__dirname, 'profile.html'),
        link: resolve(__dirname, 'link.html')
      },
      output: {
        entryFileNames: '[name].js',
      }
    },
    emptyOutDir: true,
  },
});
