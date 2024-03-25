import { createApp } from './utils'

const app = createApp()

app.get('/', async (c) =>{
     const db = await c.get('$db')
     const list = await db.article.findMany()
     return c.json({
          list
     })
})
app.get('/feed', (c) => c.json('article related to followed user'))
app.get('/:slug', (c) => c.json('single article'))
app.post('/', (c) => c.json('create article'))
app.put('/', (c) => c.json('update article'))
app.delete('/', (c) => c.json('delete article'))
app.post('/:slug/comments', (c) => c.json('add article comments'))
app.get('/:slug/comments', (c) => c.json('get article comments'))
app.delete('/:slug/comments', (c) => c.json('delete article comments'))
app.post('/:slug/favorite', (c) => c.json('favorite article'))
app.delete('/:slug/favorite', (c) => c.json('unfavorite article comments'))

export default app