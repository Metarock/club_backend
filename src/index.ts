import { ApolloServer } from "apollo-server-express";
import "reflect-metadata";
import connectRedis from "connect-redis";
import cors from "cors";
import "dotenv-safe/config";
import express from "express";
import session from "express-session";
import Redis from 'ioredis';
import path from "path";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { Page } from "./entities/Page";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { PageResolver } from "./resolvers/page";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { createPostLoader } from "./utils/createPostLoader";
import { userLoader } from "./utils/userLoader";


const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        url: process.env.DATABASE_URL,
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
        host: process.env.REDIS_HOSTNAME,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        tls: { servername: process.env.REDIS_HOSTNAME }
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

    app.use(
        session({
            name: process.env.COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60, //cookie durations
                httpOnly: true,
                sameSite: 'none',
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