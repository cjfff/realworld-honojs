import { IPrisma } from "../db"

export type Variables = {
  $db: IPrisma
  aaa: string
  jwtPayload: {
    username: string
    bio?: string
    image?: string
  }
}