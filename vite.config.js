import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [],
  build: {
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background.ts"),
        popup: resolve(__dirname, "src/popup.ts"),
        settings: resolve(__dirname, "src/settings.ts"),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
