import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'Simple dashboard built with react and java springboot',
        theme_color: '#0F172A',
        background_color: '#0F172A',
        display: 'standalone',
        icons: [
          {
            src: '/favicon.svg', // FIXED: Removed '/public' prefix
            sizes: '192x192',
            type: 'image/svg+xml' // FIXED: Match SVG format (or change file to .png)
          },
          {
            src: '/favicon.svg', // FIXED: Removed '/public' prefix
            sizes: '512x512',
            type: 'image/svg+xml', // FIXED: Match SVG format
            purpose: 'any maskable'
          }
        ]
      }
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: process.env.DOCKER_BUILD === 'true'
        ? path.resolve(__dirname, 'dist')
        : path.resolve(__dirname, "../src/main/resources/static"),
    emptyOutDir: true,
  },
})