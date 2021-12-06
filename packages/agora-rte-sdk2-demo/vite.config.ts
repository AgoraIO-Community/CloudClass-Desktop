import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import replace from '@rollup/plugin-replace';
import packageJson from '../agora-rte-sdk/package.json';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: 'worker-loader?inline=fallback!./log.worker',
        replacement: './log.worker?worker',
      },
    ],
  },
  plugins: [
    //@ts-ignore
    replace({
      preventAssignment: true,
      RTE_SDK_VERSION: JSON.stringify(packageJson.version),
    }),
    react(),
    tsconfigPaths(),
  ],
  server: {
    cors: true,
  },
});
