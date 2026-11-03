import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // If DOCKER_BUILD is true, use standard 'dist'. Otherwise, use your local Java path!
    outDir: process.env.DOCKER_BUILD === 'true'
        ? path.resolve(__dirname, 'dist')
        : path.resolve(__dirname, "../src/main/resources/static"),
    emptyOutDir: true,
  },
})