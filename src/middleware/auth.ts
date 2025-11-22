import { Context, Next } from 'hono';
import { getAuthUser } from '../utils/auth';

export async function requireAuth(c: Context, next: Next) {
  const user = await getAuthUser(c);
  if (!user) {
    return c.json({ errors: { body: ['Authentication required'] } }, 401);
  }
  c.set('user', user);
  await next();
}

