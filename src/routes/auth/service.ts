import { prisma } from '../../db'

export const getUserByEmail = (email: string) => {
    return prisma.user.findUnique({
        where: {
            email
        }
    })
}


export const getUserByUserName = (username: string) => {
    return prisma.user.findFirst({
        where: {
            username
        }
    })
}