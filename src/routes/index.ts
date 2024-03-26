import config from '../config'
import auth from './auth'
import user from './user'
import profiles from './profiles'
import articles from './articles'
import tags from './tags'
import { prisma } from '../db'
import { createApp, createJWTMiddleware } from './utils'
import { logger } from 'hono/logger'
import { poweredBy } from 'hono/powered-by'

const app = createApp().basePath(config.basePath)

app.use(logger())
app.use(poweredBy())

app.use(async (ctx, next) => {
    ctx.set('$db', prisma)
    await next()
})

app.route('/users', auth)
app.route('/user', user)
app.route('/profiles', profiles)
app.route('/articles', articles)
app.route('/tags', tags)

export default app