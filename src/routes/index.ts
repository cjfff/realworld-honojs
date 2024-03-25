import config from '../config'
import users from './users'
import profiles from './profiles'
import articles from './articles'
import tags from './tags'
import { prisma } from '../db'
import { createApp } from './utils'

const app = createApp().basePath(config.basePath)

app.use(async (ctx, next) => {
    ctx.set('$db', prisma)
    await next()
})

app.route('/users', users)
app.route('/profiles', profiles)
app.route('/articles', articles)
app.route('/tags', tags)

export default app