import { getUserByEmail } from "../auth/service";
import { createApp, createJWTMiddleware } from "../utils";
import { pick } from "lodash-es";
import { updateValidator } from "./scheme";
const app = createApp();

app.use(createJWTMiddleware());
app.get("/", async (c) => {
  const body = c.get("jwtPayload");
  const user = await getUserByEmail(body.email);

  return c.json({
    user: pick(user, "email", "bio", "image", "username"),
  });
});
app.put("/", updateValidator(), async (c) => {
  const body = c.req.valid("json");
  const { email } = c.get("jwtPayload");
  const user = await getUserByEmail(email);

  const newUser = await c.get("$db").user.update({
    where: {
      id: user?.id,
    },
    data: {
      email: body.email,
      image: body.image,
      bio: body.bio,
    },
  });
  return c.json({
    user: pick(newUser, "email", "bio", "image", "username"),
  });
});

export default app;
