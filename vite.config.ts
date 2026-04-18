import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      {
        name: "log-api-url",
        configResolved() {
          if (mode === "development") {
            console.log(
              `\n  API URL: ${env.VITE_API_URL ?? "/api/v1 (proxied)"}\n`
            );
          }
        },
      },
    ],
    server: {
      host: "0.0.0.0",   // needed inside Docker
      port: 5173,
      proxy: {
        "/api": {
          target: "http://backend:8000",  // Docker service name
          changeOrigin: true,
        },
      },
    },
  };
});
