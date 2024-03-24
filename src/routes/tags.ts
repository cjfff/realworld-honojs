import { createApp } from './utils'

const app = createApp()

app.get('/tags', (c) => c.json('tags list'))

export default app