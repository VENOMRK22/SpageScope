import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/voice': {
          target: 'https://api.streamelements.com/kappa/v2/speech',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/voice/, ''),
          secure: false
        },
        '/api/groq': {
          target: 'https://api.groq.com/openai/v1',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/groq/, ''),
          secure: false,
          headers: {
            'Authorization': `Bearer ${env.GROQ_API_KEY}`
          }
        }
      }
    }
  }
})
