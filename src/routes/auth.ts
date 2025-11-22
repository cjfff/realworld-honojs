import { ZodError } from 'zod';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken, getAuthUser } from '../utils/auth';
import { loginSchema, registerSchema, updateUserSchema } from '../utils/validation';
import { transformUser } from '../utils/transform';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { formatZodError, formatError } from '../utils/error-handler';
import { createRouter } from '../utils/crate-route';
const auth = createRouter()

// POST /api/users/login
auth.post('/users/login', async (c) => {
  try {
    const body = await c.req.json();
    const { user } = loginSchema.parse(body);

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser || !(await comparePassword(user.password, dbUser.password))) {
      return c.json(
        formatError('email or password is invalid'),
        401
      );
    }

    const token = await generateToken({
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
    });

    const userResponse = transformUser(dbUser);


    return c.json({ user: { ...userResponse, token }});
  } catch (error: any) {
    if (error instanceof ZodError) {
      return c.json(formatZodError(error), 422);
    }
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// POST /api/users
auth.post('/users', async (c) => {
  try {
    const body = await c.req.json();
    console.log(body, '===')

    const { user } = registerSchema.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: user.email }, { username: user.username }],
      },
    });

    if (existingUser) {
      return c.json(
        { errors: { body: ['User already exists'] } },
        422
      );
    }

    const hashedPassword = await hashPassword(user.password);
    const dbUser = await prisma.user.create({
      data: {
        email: user.email,
        username: user.username,
        password: hashedPassword,
      },
    });

    const token = await generateToken({
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
    });

    const userResponse = transformUser(dbUser);
    userResponse.token = token;

    return c.json({ user: userResponse }, 201);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return c.json(formatZodError(error), 422);
    }
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// GET /api/user
auth.get('/user', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    const dbUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });

    if (!dbUser) {
      return c.json({ errors: { body: ['User not found'] } }, 404);
    }

    const token = await generateToken({
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
    });

    const userResponse = transformUser(dbUser);
    userResponse.token = token;

    return c.json({ user: userResponse });
  } catch (error: any) {
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// PUT /api/user
auth.put('/user', requireAuth, async (c) => {
  try {
    const body = await c.req.json();

    const { user: updateData } = updateUserSchema.parse(body);
    const currentUser = c.get('user');

    const updatePayload: any = {};
    if (updateData.email) updatePayload.email = updateData.email;
    if (updateData.username) updatePayload.username = updateData.username;
    if (updateData.bio !== undefined) updatePayload.bio = updateData.bio || null;
    if (updateData.image !== undefined) updatePayload.image = updateData.image || null;
    if (updateData.password) {
      updatePayload.password = await hashPassword(updateData.password);
    }

    // Check for conflicts
    if (updateData.email || updateData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: currentUser.id } },
            {
              OR: [
                updateData.email ? { email: updateData.email } : {},
                updateData.username ? { username: updateData.username } : {},
              ],
            },
          ],
        },
      });

      if (existingUser) {
        return c.json(
          { errors: { body: ['Email or username already taken'] } },
          422
        );
      }
    }

    const dbUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updatePayload,
    });

    const token = await generateToken({
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.username,
    });

    return c.json({ user: {...transformUser(dbUser), token} });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return c.json(formatZodError(error), 422);
    }
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

export default auth;

