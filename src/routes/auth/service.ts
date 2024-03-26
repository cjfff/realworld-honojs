import { prisma } from "../../db";

export const getUserByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      email: true,
      bio: true,
      username: true,
      image: true,
      id: true,
    },
  });
};

export const getUserByUserName = (username: string) => {
  return prisma.user.findFirst({
    where: {
      username,
    },
    select: {
      email: true,
      bio: true,
      username: true,
      image: true,
      id: true,
    },
  });
};
