"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const argon2 = __importStar(require("argon2"));
const User_1 = require("../entities/User");
const type_graphql_1 = require("type-graphql");
const UsernamePasswordInput_1 = require("../shared/UsernamePasswordInput");
const validateRegister_1 = require("../utils/validateRegister");
const typeorm_1 = require("typeorm");
const constants_1 = require("../shared/constants");
const FieldError_1 = require("../shared/FieldError");
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let UserResolver = class UserResolver {
    hello() {
        return "hi there";
    }
    users() {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.User.find();
        });
    }
    me({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.session.userId) {
                return User_1.User.findOne(req.session.userId);
            }
            return undefined;
        });
    }
    login(usernameOrEmail, password, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne(usernameOrEmail.includes('@') ? { where: { email: usernameOrEmail } } : { where: { clubUsername: usernameOrEmail } });
            if (!user) {
                return {
                    errors: [{
                            field: 'usernameorEmail',
                            message: 'username does not exist'
                        }]
                };
            }
            const valid = yield argon2.verify(user.password, password);
            if (!valid) {
                return {
                    errors: [{
                            field: 'password',
                            message: 'inputted the wrong password'
                        }]
                };
            }
            req.session.userId = user.id;
            console.log("user id (logged in): ", req.session.userId);
            return { user };
        });
    }
    register(options, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const errors = (0, validateRegister_1.validateRegister)(options);
            if (errors) {
                return { errors };
            }
            const hashedPassword = yield argon2.hash(options.password);
            let user;
            try {
                const result = yield (0, typeorm_1.getConnection)()
                    .createQueryBuilder()
                    .insert()
                    .into(User_1.User)
                    .values({
                    clubUsername: options.clubUsername,
                    password: hashedPassword,
                    email: options.email,
                    university: options.university,
                    clubName: options.clubName
                })
                    .returning('*')
                    .execute();
                console.log("result typeorm", result);
                user = result.raw[0];
            }
            catch (err) {
                console.log("error for register: ", err);
                if (err.code === "23505") {
                    return {
                        errors: [{
                                field: 'clubUsername',
                                message: 'club username already exists and taken'
                            }]
                    };
                }
            }
            console.log('club user name: ', user);
            console.log('club id', user.id);
            req.session.userId = user.id;
            console;
            return { user };
        });
    }
    logout({ req, res }) {
        return new Promise((resolve) => req.session.destroy(err => {
            if (err) {
                console.log("error in logging out: ", err);
                resolve(false);
                return;
            }
            console.log("logged out successfully");
            resolve(true);
            res.clearCookie(constants_1.COOKIE_NAME);
        }));
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "hello", null);
__decorate([
    (0, type_graphql_1.Query)(() => [User_1.User]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "users", null);
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('usernameOrEmail')),
    __param(1, (0, type_graphql_1.Arg)("password")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordInput_1.UsernamePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "logout", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map