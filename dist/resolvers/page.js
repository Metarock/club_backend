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
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
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
            return Page_1.Page.find({ relations: ['creator'] });
        });
    }
    creator(page, { userLoader }) {
        return userLoader.load(page.creatorId);
    }
    page(id) {
        return Page_1.Page.findOne(id, { relations: ['creator'] });
    }
    createPage({ req }, pageTitle, pageText, aboutUs, pageimgUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const clubOwner = yield Page_1.Page.findOne({ where: { creatorId: req.session.userId } });
            if (clubOwner)
                throw new Error("Can only post once");
            pageTitle = pageTitle.trim();
            pageText = pageText.trim();
            aboutUs = aboutUs.trim();
            if (!aboutUs || !pageText || !pageTitle)
                throw new Error("Input cannot be empty, please fill it");
            if (pageimgUrl)
                pageimgUrl = pageimgUrl.trim();
            return Page_1.Page.create({
                pageTitle,
                pageText,
                aboutUs,
                pageimgUrl,
                creatorId: req.session.userId
            }).save();
        });
    }
    editPage({ req }, id, pageTitle, pageText, aboutUs, pageimgUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, typeorm_1.getConnection)()
                .createQueryBuilder()
                .update(Page_1.Page)
                .set({ pageTitle, pageText, aboutUs, pageimgUrl })
                .where('id = :id and "creatorId" = :creatorId', {
                id,
                creatorId: req.session.userId
            })
                .returning("*")
                .execute();
            return result.raw[0];
        });
    }
    deletePage(id, { req }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Page_1.Page.delete({ id, creatorId: req.session.userId });
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
    (0, type_graphql_1.FieldResolver)(() => User_1.User),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Page_1.Page, Object]),
    __metadata("design:returntype", void 0)
], PageResolver.prototype, "creator", null);
__decorate([
    (0, type_graphql_1.Query)(() => Page_1.Page, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "page", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Page_1.Page),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('pageTitle', () => String)),
    __param(2, (0, type_graphql_1.Arg)('pageText', () => String)),
    __param(3, (0, type_graphql_1.Arg)('aboutUs', () => String)),
    __param(4, (0, type_graphql_1.Arg)('pageimgUrl', () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "createPage", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Page_1.Page, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(2, (0, type_graphql_1.Arg)('pageTitle')),
    __param(3, (0, type_graphql_1.Arg)('pageText')),
    __param(4, (0, type_graphql_1.Arg)('aboutUs')),
    __param(5, (0, type_graphql_1.Arg)('pageimgUrl', () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "editPage", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)('id', () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PageResolver.prototype, "deletePage", null);
PageResolver = __decorate([
    (0, type_graphql_1.Resolver)(Page_1.Page)
], PageResolver);
exports.PageResolver = PageResolver;
//# sourceMappingURL=page.js.map