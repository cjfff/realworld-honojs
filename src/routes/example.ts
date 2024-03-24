import { Hono } from 'hono'

const app = new Hono()

app.get('/example', (c) => c.json('example'))

export default app