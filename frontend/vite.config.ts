import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  base: '/GlobeTrotter/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Ensure shared/ imports resolve 'zod' from frontend's own node_modules
      // (shared/ is outside frontend/ so Node resolution walks past frontend/node_modules)
      zod: path.resolve(__dirname, 'node_modules/zod'),
    },
  },
});

