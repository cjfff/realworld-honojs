import { Hono } from 'hono'

const app = new Hono()

app.get('/:username', (c) => c.json('get user profile'))
app.post('/:username/follow', (c) => c.json('follow user'))
app.delete('/:username/follow', (c) => c.json('unfollow user'))

export default app