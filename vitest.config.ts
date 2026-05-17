import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * Vitest config — kept separate from vite.config.ts so dev/build can stay
 * focused on serving the app and tests get their own jsdom env without a
 * conditional inside vite.config.
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    // Prateek: only pick up files we explicitly mark as tests. The default
    // `**/*.test.{ts,tsx}` already covers us; spelled out for clarity.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Skip the Playwright suite — that runs via `npm run e2e`, not vitest.
    exclude: ["node_modules", "dist", "e2e/**", ".idea", ".git", ".cache"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/test/**",
        "src/types/api.generated.ts",
      ],
    },
  },
});
