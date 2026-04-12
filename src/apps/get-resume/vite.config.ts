import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import tailwindcss from "@tailwindcss/vite";

const INPUT = process.env.INPUT;
if (!INPUT) {
  throw new Error("INPUT environment variable is not set");
}

const isDevelopment = process.env.NODE_ENV === "development";

export default defineConfig({
  plugins: [tailwindcss(), react(), viteSingleFile()],
  build: {
    assetsInlineLimit: Infinity,
    sourcemap: isDevelopment ? "inline" : undefined,
    cssMinify: !isDevelopment,
    minify: !isDevelopment,
    cssCodeSplit: false,

    rollupOptions: {
      input: INPUT,
    },
    outDir: "../../../dist/mcp-lambda",
    emptyOutDir: false,
  },
});
