"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefreshToken = exports.createAccessToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const createAccessToken = (user) => {
    return (0, jsonwebtoken_1.sign)({ userId: user.id, }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};
exports.createAccessToken = createAccessToken;
const createRefreshToken = (user) => {
    return (0, jsonwebtoken_1.sign)({ userId: user.id, tokenVersion: user.tokenVersion }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};
exports.createRefreshToken = createRefreshToken;
//# sourceMappingURL=auth.js.map