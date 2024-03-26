import { Context } from "hono";
import { getUserByUserName } from "../auth/service";
import { pick } from "lodash-es";

export const getProfile = async ({ c }: { c: Context }) => {
  const username = c.req.param("username");

  const currentUser = c.get("jwtPayload");

  const user = await getUserByUserName(username);

  const extraData = {} as {
    following?: boolean;
  };
  if (currentUser && user) {
    const followingRecord = await c.get("$db").follow.findFirst({
      where: {
        followedUserId: user.id,
        followingUserId: currentUser.id,
        status: 1,
      },
    });

    extraData.following = !!followingRecord;
  }
  return {
    ...pick(user, "username", "bio", "image"),
    ...extraData,
  };
};

export const switchFollow = async (c: Context) => {
  const currentUser = c.get("jwtUser");
  const username = c.req.param("username");

  const followUser = await getUserByUserName(username);

  if (!followUser || followUser.id === currentUser.id) {
    return c.body("", 403);
  }

  const input = {
    followedUserId: followUser.id,
    followingUserId: currentUser.id,
  };

  const followedData = await c.get("$db").follow.findFirst({
    where: {
      ...input,
    },
  });

  await c.get("$db").follow.upsert({
    where: {
      id: followedData?.id || 0,
    },
    update: {
      ...input,
      status: followedData?.status === 1 ? 0 : 1,
    },
    create: {
      ...input,
      status: 1,
    },
  });

  const profile = await getProfile({
    c,
  });

  return profile;
};
