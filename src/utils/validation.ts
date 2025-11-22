import { z } from 'zod';

export const loginSchema = z.object({
  user: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

export const registerSchema = z.object({
  user: z.object({
    username: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
  }),
});

export const updateUserSchema = z.object({
  user: z.object({
    email: z.string().email().optional(),
    username: z.string().min(1).optional(),
    password: z.string().min(8).optional(),
    bio: z.string().optional(),
    image: z.string().url().optional().or(z.literal('')),
  }),
});

export const createArticleSchema = z.object({
  article: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    body: z.string().min(1),
    tagList: z.array(z.string()).optional(),
  }),
});

export const updateArticleSchema = z.object({
  article: z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    body: z.string().min(1).optional(),
    tagList: z.array(z.string()).optional(),
  }),
});

export const createCommentSchema = z.object({
  comment: z.object({
    body: z.string().min(1),
  }),
});

