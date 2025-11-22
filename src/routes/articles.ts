import { ZodError } from 'zod';
import { getAuthUser } from '../utils/auth';
import { slugify } from '../utils/slug';
import { createArticleSchema, updateArticleSchema } from '../utils/validation';
import { transformArticle } from '../utils/transform';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { formatZodError, formatError } from '../utils/error-handler';
import { createRouter } from '../utils/crate-route';
const articles = createRouter()

// GET /api/articles
articles.get('/articles', async (c) => {
  try {
    const currentUser = await getAuthUser(c);
    const tag = c.req.query('tag');
    const author = c.req.query('author');
    const favorited = c.req.query('favorited');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    const where: any = {};

    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: tag,
          },
        },
      };
    }

    if (author) {
      where.author = {
        username: author,
      };
    }

    if (favorited) {
      where.favorites = {
        some: {
          user: {
            username: favorited,
          },
        },
      };
    }

    const articlesList = await prisma.article.findMany({
      where,
      include: {
        author: {
          include: {
            following: currentUser
              ? {
                  where: { followerId: currentUser.id },
                }
              : {
                  where: { followerId: -1 },
                },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        favorites: currentUser
          ? {
              where: { userId: currentUser.id },
            }
          : {
              where: { userId: -1 },
            },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const articlesCount = await prisma.article.count({ where });

    const transformedArticles = articlesList.map((article) =>
      transformArticle(
        {
          ...article,
          favoritesCount: article._count.favorites,
        },
        currentUser?.id
      )
    );

    return c.json({
      articles: transformedArticles,
      articlesCount,
    });
  } catch (error: any) {
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// GET /api/articles/feed
articles.get('/articles/feed', requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    // Get users that current user is following
    const following = await prisma.follow.findMany({
      where: { followerId: currentUser.id },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return c.json({
        articles: [],
        articlesCount: 0,
      });
    }

    const articlesList = await prisma.article.findMany({
      where: {
        authorId: {
          in: followingIds,
        },
      },
      include: {
        author: {
          include: {
            following: currentUser
              ? {
                  where: { followerId: currentUser.id },
                }
              : {
                  where: { followerId: -1 },
                },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        favorites: {
          where: { userId: currentUser.id },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    const articlesCount = await prisma.article.count({
      where: {
        authorId: {
          in: followingIds,
        },
      },
    });

    const transformedArticles = articlesList.map((article) =>
      transformArticle(
        {
          ...article,
          favoritesCount: article._count.favorites,
        },
        currentUser.id
      )
    );

    return c.json({
      articles: transformedArticles,
      articlesCount,
    });
  } catch (error: any) {
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// GET /api/articles/:slug
articles.get('/articles/:slug', async (c) => {
  try {
    const slug = c.req.param('slug');
    const currentUser = await getAuthUser(c);
    console.log(currentUser, "currentUser");

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          include: {
            'following': currentUser
              ? {
                  where: { "followerId": currentUser.id },
                }
              : {
                  where: { followerId: -1 },
                },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        favorites: currentUser
          ? {
              where: { userId: currentUser.id },
            }
          : {
              where: { userId: -1 },
            },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    if (!article) {
      return c.json({ errors: { body: ['Article not found'] } }, 404);
    }

    const transformedArticle = transformArticle(
      {
        ...article,
        favoritesCount: article._count.favorites,
      },
      currentUser?.id
    );

    return c.json({ article: transformedArticle });
  } catch (error: any) {
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// POST /api/articles
articles.post('/articles', requireAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { article } = createArticleSchema.parse(body);
    const currentUser = c.get('user');

    const slug = slugify(article.title);
    let finalSlug = slug;
    let counter = 1;

    // Ensure unique slug
    while (await prisma.article.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Create or get tags
    const tagNames = article.tagList || [];
    const tagPromises = tagNames.map((tagName) =>
      prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      })
    );
    const tags = await Promise.all(tagPromises);
    console.log(tags, " tags");
    const createdArticle = await prisma.article.create({
      data: {
        slug: finalSlug,
        title: article.title,
        description: article.description,
        body: article.body,
        authorId: currentUser.id,
        tags: {
          create: tags.map((tag) => ({
            tagId: tag.id,
          })),
        },
      },
      include: {
        author: {
          include: {
            followers: {
              where: { followerId: currentUser.id },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        favorites: {
          where: { userId: currentUser.id },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    const transformedArticle = transformArticle(
      {
        ...createdArticle,
        favoritesCount: createdArticle._count.favorites,
      },
      currentUser.id
    );

    return c.json({ article: transformedArticle }, 201);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return c.json(formatZodError(error), 422);
    }
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// PUT /api/articles/:slug
articles.put('/articles/:slug', requireAuth, async (c) => {
  try {
    const slug = c.req.param('slug');
    const body = await c.req.json();
    const { article: updateData } = updateArticleSchema.parse(body);
    const currentUser = c.get('user');

    const existingArticle = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: true,
      },
    });

    if (!existingArticle) {
      return c.json({ errors: { body: ['Article not found'] } }, 404);
    }

    if (existingArticle.authorId !== currentUser.id) {
      return c.json({ errors: { body: ['Forbidden'] } }, 403);
    }

    const updatePayload: any = {};
    if (updateData.title) {
      updatePayload.title = updateData.title;
      // Update slug if title changed
      const newSlug = slugify(updateData.title);
      let finalSlug = newSlug;
      let counter = 1;
      while (
        await prisma.article.findFirst({
          where: {
            slug: finalSlug,
            id: { not: existingArticle.id },
          },
        })
      ) {
        finalSlug = `${newSlug}-${counter}`;
        counter++;
      }
      updatePayload.slug = finalSlug;
    }
    if (updateData.description) updatePayload.description = updateData.description;
    if (updateData.body) updatePayload.body = updateData.body;

    const updatedArticle = await prisma.article.update({
      where: { id: existingArticle.id },
      data: updatePayload,
      include: {
        author: {
          include: {
            followers: {
              where: { followerId: currentUser.id },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        favorites: {
          where: { userId: currentUser.id },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    const transformedArticle = transformArticle(
      {
        ...updatedArticle,
        favoritesCount: updatedArticle._count.favorites,
      },
      currentUser.id
    );

    return c.json({ article: transformedArticle });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return c.json(formatZodError(error), 422);
    }
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// DELETE /api/articles/:slug
articles.delete('/articles/:slug', requireAuth, async (c) => {
  try {
    const slug = c.req.param('slug');
    const currentUser = c.get('user');

    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      return c.json({ errors: { body: ['Article not found'] } }, 404);
    }

    if (article.authorId !== currentUser.id) {
      return c.json({ errors: { body: ['Forbidden'] } }, 403);
    }

    await prisma.article.delete({
      where: { id: article.id },
    });

    return c.body(null, 204);
  } catch (error: any) {
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// POST /api/articles/:slug/favorite
articles.post('/articles/:slug/favorite', requireAuth, async (c) => {
  try {
    const slug = c.req.param('slug');
    const currentUser = c.get('user');

    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      return c.json({ errors: { body: ['Article not found'] } }, 404);
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_articleId: {
          userId: currentUser.id,
          articleId: article.id,
        },
      },
    });

    if (!existingFavorite) {
      await prisma.favorite.create({
        data: {
          userId: currentUser.id,
          articleId: article.id,
        },
      });
    }

    const updatedArticle = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          include: {
            followers: {
              where: { followerId: currentUser.id },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        favorites: {
          where: { userId: currentUser.id },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    const transformedArticle = transformArticle(
      {
        ...updatedArticle!,
        favoritesCount: updatedArticle!._count.favorites,
      },
      currentUser.id
    );

    return c.json({ article: transformedArticle });
  } catch (error: any) {
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// DELETE /api/articles/:slug/favorite
articles.delete('/articles/:slug/favorite', requireAuth, async (c) => {
  try {
    const slug = c.req.param('slug');
    const currentUser = c.get('user');

    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      return c.json({ errors: { body: ['Article not found'] } }, 404);
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: currentUser.id,
        articleId: article.id,
      },
    });

    const updatedArticle = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          include: {
            followers: {
              where: { followerId: currentUser.id },
            },
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        favorites: {
          where: { userId: currentUser.id },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    const transformedArticle = transformArticle(
      {
        ...updatedArticle!,
        favoritesCount: updatedArticle!._count.favorites,
      },
      currentUser.id
    );

    return c.json({ article: transformedArticle });
  } catch (error: any) {
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

export default articles;

