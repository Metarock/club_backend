import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { User } from "./entities/User";
import { UserResolver } from "./resolvers/user";


const main = async () => {
    const app = express();
    app.get("/", (_req, res) => res.send("hello"));

    await createConnection();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [UserResolver]
        })
    })

    apolloServer.applyMiddleware({ app });
    app.listen(4000, () => {
        console.log("server working");
    })
}

main();
