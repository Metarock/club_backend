"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPostAuth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const isPostAuth = ({ context }, next) => {
    const authorization = context.req.headers['authorization'];
    if (!authorization) {
        throw new Error("not autheticated");
    }
    try {
        const token = authorization.split(' ')[1];
        const payload = (0, jsonwebtoken_1.verify)(token, process.env.ACCESS_TOKEN_SECRET);
        context.postPayLoad = payload;
    }
    catch (err) {
        console.log(err);
        throw new Error("not autheticated");
    }
    return next();
};
exports.isPostAuth = isPostAuth;
//# sourceMappingURL=isPostAuth.js.map