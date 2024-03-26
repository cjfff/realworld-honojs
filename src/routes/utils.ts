import { Hono, MiddlewareHandler } from "hono";
import { verify } from "hono/jwt";
import config from "../config";

export const createApp = () => {
  const app = new Hono();

  return app;
};

export const createJWTMiddleware = (
  verifyBoolean = true
): MiddlewareHandler => {
  return async (c, next) => {
    try {
      const tokenStr = c.req.header("Authorization");
      if (!tokenStr && verifyBoolean) {
        return c.json("UnAuthorized", 400);
      }
      const token = tokenStr?.split(" ")?.[1];

      if (!token && verifyBoolean) {
        return c.json("UnAuthorized", 400);
      }

      const payload = await verify(token!, config.secret);

      c.set("jwtPayload", payload);
      c.set("jwtUser", payload);
    } catch (e) {
      if (verifyBoolean) {
        return c.json("UnAuthorized", 400);
      }
    }

    await next();
  };
};
