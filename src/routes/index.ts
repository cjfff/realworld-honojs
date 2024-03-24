// index.ts
import { Hono } from 'hono'
import users from './users'
import profiles from './profiles'
import articles from './articles'
import tags from './tags'

const app = new Hono()

app.route('/users', users)
app.route('/profiles', profiles)
app.route('/articles', articles)
app.route('/tags', tags)

export default app