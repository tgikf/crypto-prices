import { defineConfig } from "vite";
import suidPlugin from "@suid/vite-plugin";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  worker: { format: "es" },
  plugins: [suidPlugin(), solidPlugin()],
  build: {
    target: "esnext",
  },
});
