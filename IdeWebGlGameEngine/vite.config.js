// BLOCK 1 — imports
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// BLOCK 2 — state / types / constants
const rootDir = '.';
const devPort = 5173;

// BLOCK 3 — operators
function createConfig() {
  return defineConfig({
    root: rootDir,
    plugins: [vue()],
    server: { port: devPort, open: true }
  });
}

// BLOCK 4 — exports
export default createConfig();
