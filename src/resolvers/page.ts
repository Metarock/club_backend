import { Page } from "../entities/Page";
import { Arg, ArgsType, Ctx, Field, InputType, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { FieldError } from "../shared/FieldError";

//TODO 
// RENAME TO CREATE PAGE
@InputType()
class PageInput {
    @Field()
    pageTitle: string;
    @Field()
    pageText: string;
    @Field()
    aboutUs: string;
    @Field()
    pageimgUrl: string;
}

@ObjectType()
class PaginatedPage {
    @Field(() => [Page])
    posts: Page[]
    @Field()
    hasMore: boolean
}

@ObjectType()
class PageResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => Page, { nullable: true })
    page?: Page
}
@Resolver(Page)
export class PageResolver {


    //find all post
    @Query(() => [Page])
    //return an array of post
    async pages(): Promise<Page[]> {
        return Page.find();
    }

    //find a post
    @Query(() => Page, { nullable: true })
    page(@Arg('id', () => Int) id: number): Promise<Page | undefined> {
        return Page.findOne(id);
    }

    //create post
    @Mutation(() => Page)
    @UseMiddleware(isAuth) //authentication for posting first
    async createPage(
        @Ctx() { req }: MyContext,
        @Arg('pageTitle', () => String) pageTitle: string,
        @Arg('pageText', () => String) pageText: string,
        @Arg('aboutUs', () => String) aboutUs: string,
        @Arg('pageimgUrl', () => String, { nullable: true }) pageimgUrl?: string,
    ): Promise<Page> {

        //club owners can only post one page
        const clubOwner = await Page.findOne({ where: { creatorId: req.session.userId } });

        if (clubOwner) throw new Error("Can only post once");
        pageTitle = pageTitle.trim();
        pageText = pageText.trim();
        aboutUs = aboutUs.trim();
        if (!aboutUs || !pageText || !pageTitle) throw new Error("Input cannot be empty, please fill it");
        if (pageimgUrl) pageimgUrl = pageimgUrl.trim();

        req.session.pageId = req.session.userId; //saves page id
        return Page.create({
            pageTitle,
            pageText,
            aboutUs,
            pageimgUrl,
            creatorId: req.session.userId //get session id
        }).save();
    }

    //delete Page
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePage(
        @Arg('id', () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<Boolean> {
        await Page.delete({ id, creatorId: req.session.userId }) // only deeltes Page by the user
        return true;
    }

}