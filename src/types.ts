import { Request, Response } from "express";


export type MyContext = {
    req: Request & { session: Express.Session & { userId?: number, pageId: number } };
    res: Response;
}