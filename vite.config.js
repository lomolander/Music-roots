import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { handler as deezerPreviewHandler } from './netlify/functions/deezer-preview.mjs'

const deezerPreviewDevFunction = () => ({
  name: 'deezer-preview-dev-function',
  configureServer(server) {
    server.middlewares.use('/.netlify/functions/deezer-preview', async (request, response) => {
      const url = new URL(request.url || '/', 'http://localhost')
      const result = await deezerPreviewHandler({
        httpMethod: request.method,
        queryStringParameters: Object.fromEntries(url.searchParams),
      })
      response.statusCode = result.statusCode
      Object.entries(result.headers || {}).forEach(([key, value]) => response.setHeader(key, value))
      response.end(result.body)
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), deezerPreviewDevFunction()],
})
