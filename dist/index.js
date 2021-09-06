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
require("reflect-metadata");
require("dotenv-safe/config");
const express_1 = __importDefault(require("express"));
const typeorm_1 = require("typeorm");
const path_1 = __importDefault(require("path"));
const ioredis_1 = __importDefault(require("ioredis"));
const User_1 = require("./entities/User");
const connect_redis_1 = __importDefault(require("connect-redis"));
const express_session_1 = __importDefault(require("express-session"));
const constants_1 = require("./shared/constants");
const Page_1 = require("./entities/Page");
const Post_1 = require("./entities/Post");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield (0, typeorm_1.createConnection)({
        type: 'postgres',
        url: 'postgres://dbezkkue:eiSkSsUQ1toLTXkkv4Rmav8OiJJjHN54@chunee.db.elephantsql.com/dbezkkue',
        logging: true,
        synchronize: true,
        migrations: [path_1.default.join(__dirname, './migrations/*')],
        entities: [User_1.User, Page_1.Page, Post_1.Post]
    });
    conn.runMigrations();
    const app = (0, express_1.default)();
    app.use((0, cookie_parser_1.default)());
    const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const redis = new ioredis_1.default({
        host: constants_1.REDIS_HOSTNAME,
        port: constants_1.REDIS_PORT,
        password: constants_1.REDIS_PASSWORD,
        tls: { servername: constants_1.REDIS_HOSTNAME }
    });
    redis.flushdb((err, succeed) => {
        console.log(succeed);
    });
    redis.on('connect', function () {
        console.log('Connected to Redis');
    });
    redis.on('error', function (err) {
        console.log('Redis error: ' + err);
    });
    app.listen(parseInt(process.env.PORT), () => {
        console.log("server working");
    });
});
main().catch(err => {
    console.log(err);
});
//# sourceMappingURL=index.js.map