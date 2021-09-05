import { Request, Response } from "express";
import { Redis } from "ioredis";
import { userLoader } from "./utils/userLoader";


export type MyContext = {
    req: Request & { session: Express.Session & { userId?: number, pageId?: number } };
    res: Response;
    redis: Redis;
    userLoader: ReturnType<typeof userLoader>;
}