import { defineConfig } from "vitest/config";
import path from "node:path";

// Standalone vitest config (does not reuse vite.config.ts — the router and
// tailwind plugins are unnecessary for unit tests and slow startup down).
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
