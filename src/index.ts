import { serve } from '@hono/node-server'
import app from './routes';
import config from './config'

console.log(`Server is running on port ${config.port}`)

serve({
  fetch: app.fetch,
  port: config.port
})
