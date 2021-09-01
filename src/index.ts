import "reflect-metadata";
import "dotenv-safe/config"
import express from "express";
import { createConnection } from "typeorm";
import path from "path";
import Redis from 'ioredis';
import { User } from "./entities/User";
import connectRedis from "connect-redis";
import session from "express-session";
import { REDIS_HOSTNAME, REDIS_PORT, REDIS_PASSWORD, COOKIE_NAME, _prod_ } from "./shared/constants";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user";
import { Page } from "./entities/Page";
import { PageResolver } from "./resolvers/page";
import { Post } from "./entities/Post";
// import { PostResolver } from "./resolvers/post";
import cors from "cors";
import cookieParser from "cookie-parser";
import { verify } from "jsonwebtoken";
import { createRefreshToken, createAccessToken } from "./services/auth";
import { sendRefreshToken } from "./services/sendRefreshToken";


const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        url: 'postgres://dbezkkue:eiSkSsUQ1toLTXkkv4Rmav8OiJJjHN54@chunee.db.elephantsql.com/dbezkkue',
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [User, Page]
    })

    conn.runMigrations();

    // await User.delete({ })

    const app = express()

    app.set("trust proxy", 1);

    app.use(cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }))

    app.use(cookieParser());
    //refreshes our cookie
    app.post("/refresh_token", async (req, res) => {
        //validate the token is correct
        const token = req.cookies.jid
        console.log("headers: ", req.cookies);

        if (!token) {
            return res.send({ ok: false, accessToken: '' });
        }

        let payload: any = null;
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
        } catch (err) {
            console.log(err);
            return res.send({ ok: false, accessToken: '' });
        }

        //token is valid and send back an access token
        const user = await User.findOne({ id: payload.userId });

        if (!user) {
            return res.send({ ok: false, accessToken: '' });
        }

        if (user.tokenVersion !== payload.tokenVersion) {
            console.log("revoked tokened");
            return res.send({ ok: false, accessToken: '' });
        }

        //refresh the refresh token
        sendRefreshToken(res, createRefreshToken(user));

        return res.send({ ok: true, accessToken: createAccessToken(user) });

    })

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver, PageResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res })
    })

    apolloServer.applyMiddleware({ app, cors: false })


    app.listen(parseInt(process.env.PORT), () => {
        console.log("server working");
    })
}

main().catch(err => {
    console.log(err);
})