import { serve } from '@hono/node-server'
import app from './routes';
import { poweredBy } from 'hono/powered-by'
import {logger} from 'hono/logger'
import config from './config'


app.use(logger())
app.use(poweredBy())

console.log(`Server is running on port ${config.port}`)

serve({
  fetch: app.fetch,
  port: config.port
})
