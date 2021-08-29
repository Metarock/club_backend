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
import { Post } from "./entities/Post";


const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        url: 'postgres://dbezkkue:eiSkSsUQ1toLTXkkv4Rmav8OiJJjHN54@chunee.db.elephantsql.com/dbezkkue',
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [User, Post]
    })

    conn.runMigrations();

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

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redis,
                disableTouch: true
            }),
            cookie: {
                path: "/",
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //cookie durations
                httpOnly: true,
                sameSite: 'lax',
                secure: _prod_
            },
            saveUninitialized: false,
            secret: process.env.SESSION_SECRET,
            resave: false
        }))


    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver],
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