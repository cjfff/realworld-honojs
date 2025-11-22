import { prisma } from '../lib/prisma';
import { formatError } from '../utils/error-handler';
import { createRouter } from '../utils/crate-route';
const tags = createRouter()

// GET /api/tags
tags.get('/tags', async (c) => {
  try {
    const tagsList = await prisma.tag.findMany({
      // orderBy: {
      //   name: "asc",
      // },
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: {
        articles: {
          _count: "desc",
        },
      },
      take: 10,
    });

    return c.json({
      tags: tagsList.map((tag) => tag.name),
    });
  } catch (error: any) {
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

// GET /api/tags/popular - Get top 10 most used tags
tags.get('/tags/popular', async (c) => {
  try {
    // Method 1: Using Prisma with _count
    const popularTags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { articles: true }
        }
      },
      orderBy: {
        articles: {
          _count: 'desc'
        }
      },
      take: 10
    });

    return c.json({
      tags: popularTags.map((tag) => ({
        name: tag.name,
        articleCount: tag._count.articles
      }))
    });
  } catch (error: any) {
    return c.json(formatError(error.message || 'An error occurred'), 500);
  }
});

export default tags;

