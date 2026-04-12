import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",   // needed inside Docker
    port: 5173,
    proxy: {
      "/api": {
        // Use VITE_API_TARGET env var in Docker (http://backend:8000),
        // falls back to localhost for local dev without Docker
        target: process.env.VITE_API_TARGET ?? "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
