import { getAuthUser } from '../utils/auth';
import { transformUser } from '../utils/transform';
import { prisma } from '../lib/prisma';
import { formatError } from '../utils/error-handler';
import { createRouter } from '../utils/crate-route';
const profiles = createRouter()

// GET /api/profiles/:username
profiles.get('/profiles/:username', async (c) => {
  try {
    const username = c.req.param('username');
    const currentUser = await getAuthUser(c);

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        'following': {
          where: {
            "followerId": currentUser?.id ?? -1
          }
        },
      },
    });

    if (!user) {
      return c.json({ errors: { body: ['User not found'] } }, 404);
    }

    const profile = transformUser(
      {
        ...user,
        followers: user.following || [],
      },
      currentUser?.id
    );

    console.log(profile, 'profile')

    return c.json({ profile });
  } catch (error: any) {
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// POST /api/profiles/:username/follow
profiles.post('/profiles/:username/follow', async (c) => {
  try {
    const username = c.req.param('username');
    const currentUser = await getAuthUser(c);

    if (!currentUser) {
      return c.json({ errors: { body: ['Authentication required'] } }, 401);
    }

    const userToFollow = await prisma.user.findUnique({
      where: { username },
    });

    if (!userToFollow) {
      return c.json({ errors: { body: ['User not found'] } }, 404);
    }

    if (userToFollow.id === currentUser.id) {
      return c.json(
        { errors: { body: ['Cannot follow yourself'] } },
        422
      );
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUser.id,
          followingId: userToFollow.id,
        },
      },
    });

    if (!existingFollow) {
      await prisma.follow.create({
        data: {
          followerId: currentUser.id,
          followingId: userToFollow.id,
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        'following': {
          where: { followerId: currentUser.id },
        },
      },
    });

    const profile = transformUser(
      {
        ...user!,
        followers: user!.following,
      },
      currentUser.id
    );

    return c.json({ profile });
  } catch (error: any) {
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// DELETE /api/profiles/:username/follow
profiles.delete('/profiles/:username/follow', async (c) => {
  try {
    const username = c.req.param('username');
    const currentUser = await getAuthUser(c);

    if (!currentUser) {
      return c.json({ errors: { body: ['Authentication required'] } }, 401);
    }

    const userToUnfollow = await prisma.user.findUnique({
      where: { username },
    });

    if (!userToUnfollow) {
      return c.json({ errors: { body: ['User not found'] } }, 404);
    }

    await prisma.follow.deleteMany({
      where: {
        followerId: currentUser.id,
        followingId: userToUnfollow.id,
      },
    });

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        'following': {
          where: { followerId: currentUser.id },
        },
      },
    });

    const profile = transformUser(
      {
        ...user!,
        followers: user!.following,
      },
      currentUser.id
    );

    return c.json({ profile });
  } catch (error: any) {
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

export default profiles;

