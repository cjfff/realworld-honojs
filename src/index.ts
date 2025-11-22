import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profiles';
import articleRoutes from './routes/articles';
import commentRoutes from './routes/comments';
import tagRoutes from './routes/tags';

const app = new Hono();

app.use(logger())

// CORS middleware
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check
app.get('/', (c) => {
  return c.json({ message: 'RealWorld API with Hono.js' });
});

// API routes
app.route('/api', authRoutes);
app.route('/api', profileRoutes);
app.route('/api', articleRoutes);
app.route('/api', commentRoutes);
app.route('/api', tagRoutes);

// Error handling
app.onError((err, c) => {
  console.error(`${err}`);
  return c.json({ errors: { body: [err.message] } }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ errors: { body: ['Not found'] } }, 404);
});

const port = parseInt(process.env.PORT || '3000');

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

