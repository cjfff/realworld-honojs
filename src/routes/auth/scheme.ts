import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

export const registerSchema = z.object({
  user: z.object({
    username: z.string().min(1),
    email: z.string().min(1).email(),
    password: z.string().min(1),
  }),
});

export const registerValidator = () => zValidator("json", registerSchema);

export const loginValidator = () =>
  zValidator(
    "json",
    z.object({
      user: z.object({
        email: z.string().min(1).email(),
        password: z.string().min(1),
      }),
    })
  );
