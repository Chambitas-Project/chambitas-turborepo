import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(), // Motor Oxide — procesa @theme, @source, @layer de globals.css
    react(),
  ],
  resolve: {
    /**
     * Deduplicación de React en monorepos pnpm.
     * Sin esto, packages/ui puede traer su propia copia de react desde
     * node_modules y causar "Invalid hook call" / "multiple React instances".
     *
     * Usamos dedupe en lugar de alias con path.resolve() para evitar que
     * fallen los builds en entornos como Vercel donde la CWD puede no ser
     * apps/web-frontend y el path relativo a node_modules no se resuelve.
     */
    dedupe: ['react', 'react-dom'],
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            return 'vendor';
          }
        }
      }
    }
  },
})
