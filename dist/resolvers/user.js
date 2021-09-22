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
const uuid_1 = require("uuid");
const validateRegister_1 = require("../utils/validateRegister");
const typeorm_1 = require("typeorm");
const FieldError_1 = require("../shared/FieldError");
const sendEmail_1 = require("../utils/sendEmail");
const isAuth_1 = require("../middleware/isAuth");
const emailTemplate_1 = require("../utils/emailTemplate");
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
    azureupdated() {
        return "azure is updated";
    }
    doubleChecking() {
        return "double checking it works";
    }
    users() {
        return __awaiter(this, void 0, void 0, function* () {
            return User_1.User.find();
        });
    }
    me({ req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.session.userId) {
                return null;
            }
            return User_1.User.findOne(req.session.userId);
        });
    }
    login(usernameOrEmail, password, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne(usernameOrEmail.includes('@') ? { where: { email: usernameOrEmail } } : { where: { clubUsername: usernameOrEmail } });
            if (!user) {
                console.log("error in login, user not found", user);
                return {
                    errors: [{
                            field: 'usernameOrEmail',
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
            req.session.pageId = req.session.userId;
            console.log("user id (logged in): ", req.session.userId);
            console.log("page id", req.session.pageId);
            return { user };
        });
    }
    register({ req }, options, userAvatar) {
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
                    clubName: options.clubName,
                    userAvatar: userAvatar
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
                                field: 'email' || 'clubUsername',
                                message: 'email or club username already exists and taken'
                            }]
                    };
                }
            }
            console.log('club user name: ', user);
            console.log('club id', user.id);
            req.session.userId = user.id;
            yield (0, sendEmail_1.sendEmail)(options.email, yield (0, emailTemplate_1.registrationEmail)(options.clubName, process.env.CORS_ORIGIN));
            return { user };
        });
    }
    editProfile(id, clubUsername, clubName, university, email, userAvatar) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield (0, typeorm_1.getConnection)()
                .createQueryBuilder()
                .update(User_1.User)
                .set({ clubUsername, clubName, university, email, userAvatar })
                .where('id = :id', {
                id
            })
                .returning("*")
                .execute();
            return user.raw[0];
        });
    }
    forgotPassword(email, { redis }) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.findOne({ where: { email } });
            if (!user) {
                return {
                    errors: [{
                            field: 'email',
                            message: 'email does not exist'
                        }]
                };
            }
            const token = (0, uuid_1.v4)();
            yield redis.set(process.env.FORGOT_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3);
            yield (0, sendEmail_1.sendEmail)(email, yield (0, emailTemplate_1.forgotemailTemplate)(user.clubUsername, process.env.CORS_ORIGIN, token));
            return { user };
        });
    }
    changePassword(token, newPassword, { redis, req }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (newPassword.length <= 5) {
                return {
                    errors: [
                        {
                            field: 'newPassword',
                            message: 'length must be greater than 5'
                        }
                    ]
                };
            }
            const key = process.env.FORGOT_PASSWORD_PREFIX + token;
            const userId = yield redis.get(key);
            if (!userId) {
                return {
                    errors: [
                        {
                            field: 'token',
                            message: 'token expired'
                        }
                    ]
                };
            }
            const userIdNum = parseInt(userId);
            const user = yield User_1.User.findOne(userIdNum);
            if (!user) {
                return {
                    errors: [
                        {
                            field: 'token',
                            message: 'user does not exist'
                        }
                    ]
                };
            }
            yield User_1.User.update({ id: userIdNum }, { password: yield argon2.hash(newPassword) });
            yield redis.del(key);
            req.session.userId = user.id;
            return { user };
        });
    }
    logout({ req, res }) {
        return new Promise((resolve) => req.session.destroy((err) => {
            if (err) {
                console.log("error in logging out: ", err);
                resolve(false);
                return;
            }
            console.log("logged out successfully");
            resolve(true);
            res.clearCookie(process.env.COOKIE_NAME);
        }));
    }
    deleteAccount(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield User_1.User.delete({ id: id });
            if (!user) {
                return false;
            }
            return true;
        });
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "hello", null);
__decorate([
    (0, type_graphql_1.Query)(() => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "azureupdated", null);
__decorate([
    (0, type_graphql_1.Query)(() => String),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "doubleChecking", null);
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
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('options')),
    __param(2, (0, type_graphql_1.Arg)('userAvatar', () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UsernamePasswordInput_1.UsernamePasswordInput, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => User_1.User, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)('clubUsername')),
    __param(2, (0, type_graphql_1.Arg)('clubName')),
    __param(3, (0, type_graphql_1.Arg)('university')),
    __param(4, (0, type_graphql_1.Arg)('email')),
    __param(5, (0, type_graphql_1.Arg)('userAvatar', () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "editProfile", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('email')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)('token')),
    __param(1, (0, type_graphql_1.Arg)('newPassword')),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteAccount", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)(User_1.User)
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map