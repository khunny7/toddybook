import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Output to top-level dist folder
    outDir: 'dist',
    emptyOutDir: true
  }
});