
import { Hono } from 'hono';
import { Variables } from '../context'

export const createRouter = () => {
    const router = new Hono< { Variables: Variables}>();
    return router
}