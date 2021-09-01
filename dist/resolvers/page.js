"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
exports.PageResolver = void 0;
const Page_1 = require("../entities/Page");
const type_graphql_1 = require("type-graphql");
const isAuth_1 = require("../middleware/isAuth");
const FieldError_1 = require("../shared/FieldError");
const jsonwebtoken_1 = require("jsonwebtoken");
let PageInput = class PageInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PageInput.prototype, "pageTitle", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PageInput.prototype, "pageText", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PageInput.prototype, "aboutUs", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PageInput.prototype, "pageimgUrl", void 0);
PageInput = __decorate([
    (0, type_graphql_1.InputType)()
], PageInput);
let PaginatedPage = class PaginatedPage {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Page_1.Page]),
    __metadata("design:type", Array)
], PaginatedPage.prototype, "posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedPage.prototype, "hasMore", void 0);
PaginatedPage = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedPage);
let PageResponse = class PageResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError_1.FieldError], { nullable: true }),
    __metadata("design:type", Array)
], PageResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => Page_1.Page, { nullable: true }),
    __metadata("design:type", Page_1.Page)
], PageResponse.prototype, "page", void 0);
PageResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], PageResponse);
let PageResolver = class PageResolver {
    pages() {
        return __awaiter(this, void 0, void 0, function* () {
            return Page_1.Page.find();
        });
    }
    page(id) {
        return Page_1.Page.findOne(id);
    }
    createPage(input, { userPayLoad }) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("user id in create post: ", userPayLoad);
            const clubOwner = yield Page_1.Page.findOne({ where: { creatorId: userPayLoad === null || userPayLoad === void 0 ? void 0 : userPayLoad.userId } });
            if (clubOwner) {
                return {
                    errors: [{
                            field: 'Create page',
                            message: 'Can only post once'
                        }]
                };
            }
            const page = yield Page_1.Page.create(Object.assign(Object.assign({}, input), { creatorId: userPayLoad === null || userPayLoad === void 0 ? void 0 : userPayLoad.userId })).save();
            return { page };
        });
    }
    deletePage(id, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const authorization = context.req.headers['authorization'];
            let user = '';
            if (!authorization) {
                return false;
            }
            const token = authorization.split(' ')[1];
            const payload = (0, jsonwebtoken_1.verify)(token, process.env.ACCESS_TOKEN_SECRET);
            yield Page_1.Page.delete({ id, creatorId: payload.userId });
            return true;
        });
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => [Page_1.Page]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "pages", null);
__decorate([
    (0, type_graphql_1.Query)(() => Page_1.Page, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "page", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => PageResponse),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('input')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PageInput, Object]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "createPage", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('id', () => String)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "deletePage", null);
PageResolver = __decorate([
    (0, type_graphql_1.Resolver)(Page_1.Page)
], PageResolver);
exports.PageResolver = PageResolver;
//# sourceMappingURL=page.js.map