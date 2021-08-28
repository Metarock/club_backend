import "reflect-metadata";
import "dotenv-safe/config"
import express from "express";
import { createConnection } from "typeorm";
import path from "path";
import Redis from 'ioredis';
import { User } from "./entities/User";
import connectRedis from "connect-redis";
import session from "express-session";
import { REDIS_HOSTNAME, REDIS_PORT, REDIS_PASSWORD } from "./shared/constants";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user";


const main = async () => {
    const conn = await createConnection({
        type: 'postgres',
        url: 'postgres://dbezkkue:eiSkSsUQ1toLTXkkv4Rmav8OiJJjHN54@chunee.db.elephantsql.com/dbezkkue',
        logging: true,
        synchronize: true,
        migrations: [path.join(__dirname, './migrations/*')],
        entities: [User]
    })

    conn.runMigrations();

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