import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'

// The self-signed HTTPS cert is only for testing on other devices on the same
// local network during development (getUserMedia requires a secure context
// off localhost) — it has no role in the production build that Vercel serves.
export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    ...(command === 'serve' ? [basicSsl()] : []),
  ],
  server: {
    host: true,
    https: true,
  },
}))