"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPostAuth = void 0;
const isPostAuth = ({ context }, next) => {
    if (!context.req.session.userId) {
        throw new Error("not authenticated, please log in");
    }
    if (!context.req.session.pageId) {
        throw new Error("not authenticated to post");
    }
    return next();
};
exports.isPostAuth = isPostAuth;
//# sourceMappingURL=isPostAuth.js.map