import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

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
     * Forzamos que TODO el árbol use el react de apps/web-frontend.
     */
    alias: {
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
  },
})
