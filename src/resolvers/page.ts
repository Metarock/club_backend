import { Page } from "../entities/Page";
import { Arg, Ctx, Field, InputType, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { FieldError } from "../shared/FieldError";

//TODO 
// RENAME TO CREATE PAGE
@InputType()
class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;

    @Field()
    imgUrl: string;
}

@ObjectType()
class PaginatedPosts {
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
    @Mutation(() => PageResponse)
    @UseMiddleware(isAuth) //authentication for posting first
    async createPage(
        @Arg('input') input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<PageResponse> {

        //club owners can only post one page
        const clubOwner = await Page.findOne({ where: { creatorId: req.session.userId } });

        if (clubOwner) {
            return {
                errors: [{
                    field: 'Create page',
                    message: 'Can only post once'
                }]
            } // already posted
        }

        const page = await Page.create({
            ...input,
            creatorId: req.session.userId //get session id
        }).save();

        return { page }
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