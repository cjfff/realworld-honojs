import { Hono } from 'hono'

const app = new Hono()

app.get('/tags', (c) => c.json('tags list'))

export default app