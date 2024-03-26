import { Context } from "hono";
import { pick } from "lodash-es";
import { getUserByUserName } from "../auth/service";
import { createApp, createJWTMiddleware } from "../utils";
import { getProfile, switchFollow } from "./service";


const app = createApp();
app.get("/:username", createJWTMiddleware(false), async (c) => {
  const profile = await getProfile({
    c,
  });

  return c.json({
    profile,
  });
});

app.use(createJWTMiddleware());
app.post("/:username/follow", async (c) => {
  const profile = await switchFollow(c);

  return c.json({
    profile,
  });
});
app.delete("/:username/follow", async (c) => {
  const profile = await switchFollow(c);

  return c.json({
    profile,
  });
});

export default app;
