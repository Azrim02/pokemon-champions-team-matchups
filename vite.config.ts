import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dashboard lives in web/ and imports the shared modules in src/ and the JSON in data/
// directly, so there is no copy step: `npm run data` and a reload is all a data refresh needs.
export default defineConfig({
  root: 'web',
  base: './', // relative asset URLs, so dist/ can be hosted under any path (e.g. GitHub Pages)
  plugins: [react()],
  build: { outDir: '../dist', emptyOutDir: true },
  worker: { format: 'es' },
  optimizeDeps: {
    // @smogon/calc is CommonJS; src/speed.js also deep-imports one of its files.
    include: ['@smogon/calc', '@smogon/calc/dist/mechanics/util.js'],
  },
});
