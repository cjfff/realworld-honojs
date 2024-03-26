import { hash } from "../../utils/password";
import { createApp } from "../utils";
import { loginValidator, registerValidator } from "./scheme";
import { pick } from "lodash-es";
import { sign } from "hono/jwt";
import { getExpireTime } from "../../utils/expire";
import config from "../../config";
import { getUserByEmail } from './service'

const app = createApp();

const createToken = async (user: any) => {
  const userData = pick(user, "email", "bio", "image", "username", "id");
  const token = await sign(
    {
      ...pick(userData, "email", "username", "id"),
      exp: getExpireTime(),
    },
    config.secret
  );

  return token;
};

app.post("/login", loginValidator(), async (c) => {
  const body = c.req.valid("json");

  const user = await getUserByEmail(body.email)

  if (!user) {
    return c.json("not found", 400);
  }

  const userData = pick(user, "email", "bio", "image", "username", "id");
  const token = await createToken(userData);
  return c.json({
    user: {
      ...userData,
      token,
    },
  });
});

app.post("/", registerValidator(), async (c) => {
  const data = c.req.valid("json");

  const existedUser = await getUserByEmail(data.email)

  if (existedUser) {
    return c.json("user registered", 400);
  }

  const user = await c.get("$db").user.create({
    data: {
      ...data,
      password: await hash(data.password),
    },
  });
  const userData = pick(user, "email", "bio", "image", "username", "id");
  const token = await createToken(userData);

  return c.json({
    user: {
      ...userData,
      token,
    },
  });
});
app.get("/user", (c) => c.json(`get user`));
app.put("/user", (c) => c.json(`put user`));

export default app;
