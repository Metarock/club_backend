import { Request, Response } from "express";
import { Redis } from "ioredis";


export type MyContext = {
    req: Request & { session: Express.Session & { userId?: number, pageId?: number } };
    res: Response;
    redis: Redis;
}