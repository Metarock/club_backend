import { Response } from "express"
import { createRefreshToken } from "./auth";

export const sendRefreshToken = (res: Response, token: string) => {
    res.cookie('jid', token,
        {
            httpOnly: true,
            path: '/refresh_token',
        });

}