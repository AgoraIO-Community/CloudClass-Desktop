import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";

export default defineConfig({
  plugins: [reactRefresh()],
  build: {
    outDir: "lib",
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "AgoraAclassUiKitN",
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
