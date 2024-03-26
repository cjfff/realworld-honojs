import { IPrisma } from "../db"
// import "hono/dist/types/context"

type IUser = {
    username: string
    bio?: string
    id: number
    image?: string
  }


declare module 'hono' {
    interface ContextVariableMap {
        $db: IPrisma
        aaa: string
        jwtUser: IUser
        // jwtPayload: IUser
    }
}