import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { UserResolver } from "./resolvers/user";
import pg from "pg-connection-string";

const main = async () => {
    await createConnection();

    const app = express();
    app.get("/", (_req, res) => res.send("hello"));

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver]
        })
    })

    apolloServer.applyMiddleware({ app });
    app.listen(parseInt(process.env.PORT), () => {
        console.log("server working");
    })
}

main();
