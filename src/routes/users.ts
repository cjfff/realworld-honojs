import { createApp } from './utils'

const app = createApp()

app.post('/login', (c) => c.json('login'))
app.post('/users', async (c) => c.json('register an user'))
app.get('/user', (c) => c.json(`get user`))
app.put('/user', (c) => c.json(`put user`))

export default app