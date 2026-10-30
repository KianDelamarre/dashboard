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
    // 1. Go up one level from dashboard-react-frontend, then into your Java project's static folder
    outDir: path.resolve(__dirname, "../src/main/resources/static"),
    // 2. Clear out the old built files before compiling the new ones
    emptyOutDir: true,
  },
})