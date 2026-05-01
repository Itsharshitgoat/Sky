import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['electron', 'sqlite3', 'path', 'url', 'fs', 'events', 'util', 'child_process']
            }
          }
        }
      },
      preload: {
        input: 'electron/preload.ts',
        vite: {
          build: {
            rollupOptions: {
              external: ['electron', 'path', 'url', 'fs', 'events', 'util', 'child_process']
            }
          }
        }
      },
      renderer: {}
    })
  ],
})
