import { Hono } from "hono";
import { jwt } from 'hono/jwt'
import type {Variables} from "./type.d";
import config from "../config";


export const createApp = () => {
  const app = new Hono<{
    Variables: Variables 
  }>();

  return app;
};


export const createJWTMiddleware = () => {
  return jwt({
    secret: config.secret
  })
}

