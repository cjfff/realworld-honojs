import { ZodError } from 'zod';
import { getAuthUser } from '../utils/auth';
import { createCommentSchema } from '../utils/validation';
import { transformComment } from '../utils/transform';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { formatZodError, formatError } from '../utils/error-handler';
import { createRouter } from '../utils/crate-route';
const comments = createRouter()

// POST /api/articles/:slug/comments
comments.post('/articles/:slug/comments', requireAuth, async (c) => {
  try {
    const slug = c.req.param('slug');
    const body = await c.req.json();
    const { comment } = createCommentSchema.parse(body);
    const currentUser = c.get('user');

    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      return c.json({ errors: { body: ['Article not found'] } }, 404);
    }

    const createdComment = await prisma.comment.create({
      data: {
        body: comment.body,
        authorId: currentUser.id,
        articleId: article.id,
      },
      include: {
        author: {
          include: {
            followers: {
              where: { followerId: currentUser.id },
            },
          },
        },
      },
    });

    const transformedComment = transformComment(createdComment, currentUser.id);

    return c.json({ comment: transformedComment }, 201);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return c.json(formatZodError(error), 422);
    }
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// GET /api/articles/:slug/comments
comments.get('/articles/:slug/comments', async (c) => {
  try {
    const slug = c.req.param('slug');
    const currentUser = await getAuthUser(c);

    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      return c.json({ errors: { body: ['Article not found'] } }, 404);
    }

    const commentsList = await prisma.comment.findMany({
      where: { articleId: article.id },
      include: {
        author: {
          include: {
            followers: currentUser
              ? {
                  where: { followerId: currentUser.id },
                }
              : {
                  where: { followerId: -1 },
                },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const transformedComments = commentsList.map((comment) =>
      transformComment(comment, currentUser?.id)
    );

    return c.json({ comments: transformedComments });
  } catch (error: any) {
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// DELETE /api/articles/:slug/comments/:id
comments.delete('/articles/:slug/comments/:id', requireAuth, async (c) => {
  try {
    const slug = c.req.param('slug');
    const commentId = parseInt(c.req.param('id'));
    const currentUser = c.get('user');

    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      return c.json({ errors: { body: ['Article not found'] } }, 404);
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return c.json({ errors: { body: ['Comment not found'] } }, 404);
    }

    if (comment.authorId !== currentUser.id) {
      return c.json({ errors: { body: ['Forbidden'] } }, 403);
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return c.body(null, 204);
  } catch (error: any) {
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

export default comments;

