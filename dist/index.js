"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
require("reflect-metadata");
const connect_redis_1 = __importDefault(require("connect-redis"));
const cors_1 = __importDefault(require("cors"));
require("dotenv-safe/config");
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const ioredis_1 = __importDefault(require("ioredis"));
const path_1 = __importDefault(require("path"));
const type_graphql_1 = require("type-graphql");
const typeorm_1 = require("typeorm");
const Page_1 = require("./entities/Page");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const page_1 = require("./resolvers/page");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const createPostLoader_1 = require("./utils/createPostLoader");
const userLoader_1 = require("./utils/userLoader");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield (0, typeorm_1.createConnection)({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        logging: true,
        synchronize: true,
        migrations: [path_1.default.join(__dirname, './migrations/*')],
        entities: [User_1.User, Page_1.Page, Post_1.Post]
    });
    const app = (0, express_1.default)();
    const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const redis = new ioredis_1.default({
        host: process.env.REDIS_HOSTNAME,
        port: parseInt(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
        tls: { servername: process.env.REDIS_HOSTNAME }
    });
    redis.on('connect', function () {
        console.log('Connected to Redis');
    });
    redis.on('error', function (err) {
        console.log('Redis error: ' + err);
    });
    app.set("trust proxy", 1);
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }));
    app.use((0, express_session_1.default)({
        name: process.env.COOKIE_NAME,
        store: new RedisStore({
            client: redis,
            disableTouch: true
        }),
        cookie: {
            maxAge: 1000 * 60 * 60,
            httpOnly: true,
            sameSite: 'none',
            secure: process.env.NODE_ENV === "production" ? true : false,
            domain: process.env.NODE_ENV === "production" ? 'theclub-backend.azurewebsites.net' : undefined,
        },
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        resave: false
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield (0, type_graphql_1.buildSchema)({
            resolvers: [user_1.UserResolver, page_1.PageResolver, post_1.PostResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ req, res, redis, userLoader: (0, userLoader_1.userLoader)(), postLoader: (0, createPostLoader_1.createPostLoader)() }),
        playground: true,
        introspection: true,
    });
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(parseInt(process.env.PORT), () => {
        console.log("server working");
    });
});
main().catch(err => {
    console.log(err);
});
//# sourceMappingURL=index.js.map