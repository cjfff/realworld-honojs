import { pick } from "lodash-es";
import { getUserByUserName } from "../auth/service";
import { createApp, createJWTMiddleware } from "../utils";

const app = createApp();
app.get("/:username", createJWTMiddleware(false), async (c) => {
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

  return c.json({
    profile: {
      ...pick(user, "username", "bio", "image"),
      ...extraData,
    },
  });
});

app.use(createJWTMiddleware());
app.post("/:username/follow", (c) => c.json("follow user"));
app.delete("/:username/follow", (c) => c.json("unfollow user"));

export default app;
