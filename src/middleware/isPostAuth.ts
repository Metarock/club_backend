import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const isPostAuth: MiddlewareFn<MyContext> = ({ context }, next) => {

    //check if university user club is logged in
    if (!context.req.session.userId) {
        throw new Error("not authenticated, please log in");
    }

    if (!context.req.session.pageId) {
        throw new Error("not authenticated to post");
    }
    return next();
}
