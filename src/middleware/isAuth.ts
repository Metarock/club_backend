import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";
import { verify } from "jsonwebtoken";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
    const authorization = context.req.headers['authorization']

    if (!authorization) {
        throw new Error("not autheticated");
    }

    try {
        const token = authorization.split(' ')[1];
        const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!);
        context.userPayLoad = payload as any;
    } catch (err) {
        console.log(err);
        throw new Error("not autheticated");
    }

    return next();
}