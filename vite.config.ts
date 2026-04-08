import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      app: path.resolve(rootDir, 'src/app'),
      pages: path.resolve(rootDir, 'src/pages'),
      features: path.resolve(rootDir, 'src/features'),
      entities: path.resolve(rootDir, 'src/entities'),
      shared: path.resolve(rootDir, 'src/shared'),
    },
  },
});
