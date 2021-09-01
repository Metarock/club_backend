import { Request, Response } from "express";
import { Redis } from "ioredis";


export type MyContext = {
    req: Request;
    res: Response;
    userPayLoad: string;
    postPayLoad: string;
}