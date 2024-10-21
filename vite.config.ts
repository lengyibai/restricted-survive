import { fileURLToPath, URL } from "node:url";

import FullReload from "vite-plugin-full-reload";
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const getViteEnv = (target: string): any => env[target];

  return {
    base: "./",
    plugins: [
      FullReload(["src/**/*"]), // 监视src目录下所有文件的变化
      vue(),
    ],
    css: {
      preprocessorOptions: {
        less: {
          additionalData: '@import "./src/styles/index.less";',
        },
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5000,
      hmr: false,
    },
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    esbuild: {
      pure:
        getViteEnv("VITE_CLEAR_LOG") === "1"
          ? ["alert", "console.log", "console.warn", "console.error"]
          : [],
    },
    build: {
      outDir: "dist/" + getViteEnv("VITE_GAME_NAME"),
      chunkSizeWarningLimit: 2000,
      reportCompressedSize: false,
      cssTarget: "chrome61",
      rollupOptions: {
        output: {
          manualChunks: {
            game_vue: ["vue"],
            game_vueuse: ["@vueuse/core"],
            game_pixi: ["pixi.js"],
            game_spine: ["pixi-spine"],
            game_pixi_plgins: ["pixi-filters", "@pixi/sound"],
            game_js_plgins: ["decimal.js", "matter-js", "gsap", "dayjs", "mitt", "lodash"],
          },
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        },
      },
    },
  };
});
