export function transformUser(
  user: {
    email: string;
    username: string;
    bio: string | null;
    image: string | null;
    followers?: Array<{ followerId: number }>;
  },
  currentUserId?: number
) {
  const isFollowing = currentUserId && user.followers
    ? user.followers.some((f) => f.followerId === currentUserId)
    : false;

  return {
    email: user.email,
    token: undefined, // Will be set separately if needed
    username: user.username,
    bio: user.bio || null,
    image: user.image || null,
    following: isFollowing,
  };
}

export function transformArticle(
  article: {
    slug: string;
    title: string;
    description: string;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    tags: Array<{ tag: { name: string } }>;
    favorites?: Array<{ userId: number }>;
    favoritesCount?: number;
    author: {
      username: string;
      bio: string | null;
      image: string | null;
      following?: Array<{ followerId: number }>;
    };
  },
  currentUserId?: number
) {
  const isFavorited =
    currentUserId && article.favorites
      ? article.favorites.some((f) => f.userId === currentUserId)
      : false;
      
  const isFollowing =
    currentUserId && article.author.following
      ? article.author.following.some((f) => f.followerId === currentUserId)
      : false;

  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: article.tags.map((at) => at.tag.name),
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    favorited: isFavorited,
    favoritesCount: article.favoritesCount || 0,
    author: {
      username: article.author.username,
      bio: article.author.bio || null,
      image: article.author.image || null,
      following: isFollowing,
    },
  };
}

export function transformComment(
  comment: {
    id: number;
    body: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
      username: string;
      bio: string | null;
      image: string | null;
      followers?: Array<{ followerId: number }>;
    };
  },
  currentUserId?: number
) {
  const isFollowing = currentUserId && comment.author.followers
    ? comment.author.followers.some((f) => f.followerId === currentUserId)
    : false;

  return {
    id: comment.id,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    body: comment.body,
    author: {
      username: comment.author.username,
      bio: comment.author.bio || null,
      image: comment.author.image || null,
      following: isFollowing,
    },
  };
}

