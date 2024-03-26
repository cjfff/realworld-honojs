import { getUserByEmail } from "./auth/service";
import { createApp, createJWTMiddleware } from "./utils";
const app = createApp();

app.use(createJWTMiddleware());
app.get("/", async (c) => {
  const body = c.get("jwtPayload");
  const user = await getUserByEmail(body.email);

  return c.json(user);
});
app.put("/user", (c) => c.json(`put user`));

export default app;
