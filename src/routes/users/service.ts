import { prisma } from '../../db'

export const getUserByEmail = (email: string) => {
    return prisma.user.findUnique({
        where: {
            email
        }
    })
}