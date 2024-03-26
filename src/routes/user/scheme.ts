import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export const updateValidator = () =>
  zValidator(
    "json",
    z.object({
      email: z.string().min(1).email().optional(),
      bio: z.string().optional(),
      image: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional()
    })
  );