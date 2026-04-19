import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const APP = process.env.APP;
if (!APP) throw new Error("APP environment variable is not set (e.g. get-resume or get-architecture)");

const ports: Record<string, number> = {
  "get-resume": 5174,
  "get-architecture": 5175,
};

export default defineConfig({
  plugins: [tailwindcss(), react()],
  root: path.resolve(__dirname, `src/apps/${APP}`),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: ports[APP] ?? 5176,
    open: "/dev.html",
  },
  build: {
    rollupOptions: {
      input: {
        app: path.resolve(__dirname, `src/apps/${APP}/${APP}-app.html`),
        dev: path.resolve(__dirname, `src/apps/${APP}/dev.html`),
      },
    },
    outDir: path.resolve(__dirname, `dist/mcp-lambda`),
    emptyOutDir: false,
  },
});
