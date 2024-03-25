export const getExpireTime = () => {
    const now = Date.now()
    const oneDay = 60 * 60 * 1000 * 24

    return now + oneDay
}