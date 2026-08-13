import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Plain HTTP dev server. Browsers treat http://localhost as a secure context,
// so getUserMedia (camera scan) still works — this only stops working over
// HTTP if the app is opened via a LAN IP instead of localhost.
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
  },
})
