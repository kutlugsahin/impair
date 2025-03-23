import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react({
      tsDecorators: true,
    }),
    tsConfigPaths(),
  ],
  // esbuild: {
  //   target: 'es2020',
  // },
  optimizeDeps: {
    esbuildOptions: {
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
        },
      },
    },
  },
})
