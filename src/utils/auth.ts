import { SignJWT, jwtVerify } from 'jose';
import { Context } from 'hono';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  id: number;
  email: string;
  username: string;
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  return jwt;
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as JWTPayload;
}

export async function getAuthUser(c: Context): Promise<JWTPayload | null> {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Token ')) {
    return null;
  }

  const token = authHeader.substring(6);
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

