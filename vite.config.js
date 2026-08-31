import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Server-only env vars the /api functions need. These are NOT exposed to client
// code (Vite only bundles VITE_* vars); they are just made available to the
// dev-time middleware below so `npm run dev` can run the endpoints locally.
const SERVER_ENV_KEYS = ['ELEVENLABS_API_KEY', 'ELEVENLABS_VOICE_ID', 'ELEVENLABS_MODEL_ID']

// Runs files in /api as Node request handlers during `vite dev` / `vite preview`,
// mirroring how Vercel / Netlify execute them in production.
function apiDevServer() {
  const apiDir = path.resolve(process.cwd(), 'api')
  const mount = (server) => {
    server.middlewares.use((req, res, next) => {
      if (!req.url || !req.url.startsWith('/api/')) return next()
      const route = req.url.split('?')[0].replace(/\/+$/, '')
      const file = path.join(apiDir, route.slice('/api/'.length) + '.js')
      if (!file.startsWith(apiDir + path.sep) || !fs.existsSync(file)) return next()
      import(`${pathToFileURL(file).href}?t=${Date.now()}`)
        .then((mod) => (mod.default || mod.handler)(req, res))
        .catch((err) => {
          console.error(`[api] ${route} failed:`, err)
          if (!res.headersSent) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
          }
          res.end(JSON.stringify({ error: 'Internal server error' }))
        })
    })
  }
  return {
    name: 'say-it-api-dev-server',
    configureServer: mount,
    configurePreviewServer: mount,
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of SERVER_ENV_KEYS) {
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  }

  return {
    base: './',
    plugins: [react(), apiDevServer()],
    server: {
      host: true,
      port: 4000,
      open: true
    },
    preview: {
      host: true,
      port: 4000
    }
  }
})
