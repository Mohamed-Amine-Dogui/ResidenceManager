import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/ResidenceManager/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    // (JSON server): http://localhost:8000   
     // (FastAPI): http://localhost:8000/api/v1 

    proxy: {
      "/api": {
        target: "http://localhost:8000/api/v1",
        changeOrigin: true,
        secure: false, // Important for local development
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, _options) => {
          // Log proxy requests to help debug
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🟡 Proxying request:', req.method, req.url, '→', proxyReq.getHeaders());
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('🟢 Proxy response:', req.method, req.url, '←', proxyRes.statusCode);
          });
        },
      },
    },
    // Prevent HMR from causing page refreshes during form submissions
    hmr: {
      // Use a different port for HMR to avoid conflicts
      port: 24678,
    },
    // Prevent watching static files that might cause refreshes
    watch: {
      // Ignore certain patterns that might cause unnecessary reloads
      ignored: ['**/node_modules/**', '**/dist/**', '**/backend/**'],
    },
  },
  // Enhanced build configuration
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Prevent build issues that might affect development
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
}))
