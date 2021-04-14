import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";

export default defineConfig({
  plugins: [reactRefresh()],
  resolve: {
    alias: {
      '~components': path.resolve(__dirname, 'src/components'),
      '~styles': path.resolve(__dirname, 'src/styles'),
      '~utilities': path.resolve(__dirname, 'src/utilities'),
      // '~capabilities': path.resolve(__dirname, 'src/capabilities'),
      // '~capabilities/containers': path.resolve(__dirname, 'src/capabilities/containers'),
      // '~capabilities/hooks': path.resolve(__dirname, 'src/capabilities/hooks'),
    }
  },
  build: {
    outDir: "lib",
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "AgoraScenarioUIKit",
    },
    rollupOptions: {
      output: {
        globals: {
          "react": "React",
          "react-dom": "ReactDOM",
        },
      },
      external: ["react", "react-dom"],
    },
  },
});
