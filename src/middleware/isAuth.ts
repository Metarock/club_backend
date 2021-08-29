import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {

    //check if university user club is logged in
    if (!context.req.session.userId) {
        throw new Error("not authenticated");
    }

    return next();
}