import { Hono } from "hono";
import type {Variables} from "./type.d";

export const createApp = () => {
  const app = new Hono<{
    Variables: Variables 
  }>();

  return app;
};
