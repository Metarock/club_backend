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
import { PostResolver } from "./resolvers/post";
import cors from "cors";
import { userLoader } from "./utils/userLoader";
import { createPostLoader } from "./utils/createPostLoader";


const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        url: 'postgres://dbezkkue:eiSkSsUQ1toLTXkkv4Rmav8OiJJjHN54@chunee.db.elephantsql.com/dbezkkue',
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [User, Page, Post]
    })

    // const conn = await createConnection();

    conn.runMigrations();
    // await Page.delete({});

    // await User.delete({ })

    const app = express()

    const RedisStore = connectRedis(session)
    const redis = new Redis({
        host: REDIS_HOSTNAME,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        tls: { servername: REDIS_HOSTNAME }
    })

    redis.on('connect', function () {
        console.log('Connected to Redis');
    });

    redis.on('error', function (err) {
        console.log('Redis error: ' + err);
    });

    app.set("trust proxy", 1);

    app.use(cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }))

    console.log(_prod_);

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60, //cookie durations
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production" ? true : false,
                domain: process.env.NODE_ENV === "production" ? 'theclub-backend.azurewebsites.net' : undefined,

            },
            saveUninitialized: false,
            secret: process.env.SESSION_SECRET,
            resave: false
        }))


    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver, PageResolver, PostResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res, redis, userLoader: userLoader(), postLoader: createPostLoader() }),
        playground: true,
        introspection: true,
    })

    apolloServer.applyMiddleware({ app, cors: false })



    app.listen(parseInt(process.env.PORT), () => {
        console.log("server working");
    })
}

main().catch(err => {
    console.log(err);
})