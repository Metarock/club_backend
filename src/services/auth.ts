import { User } from "../entities/User";
import { sign } from "jsonwebtoken";
import { Page } from "../entities/Page";

export const createAccessToken = (user: User) => {
    return sign(
        { userId: user.id, },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" })
}

export const createRefreshToken = (user: User) => {
    return sign(
        { userId: user.id, tokenVersion: user.tokenVersion },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" })
}


export const pageCreateAccessToken = (page: Page) => {
    return sign(
        { pageId: page.id, },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "15m" })
}

export const pageCreateRefreshToken = (page: Page) => {
    return sign(
        { pageId: page.id, tokenVersion: page.tokenVersion },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" })
}