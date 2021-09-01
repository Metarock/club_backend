import { Page } from "../entities/Page";
import { Arg, Ctx, Field, InputType, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { FieldError } from "../shared/FieldError";
import { verify } from "jsonwebtoken";

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
    @Mutation(() => PageResponse)
    @UseMiddleware(isAuth) //authentication for posting first
    async createPage(
        @Arg('input') input: PageInput,
        @Ctx() { userPayLoad }: MyContext
    ): Promise<PageResponse | null> {

        console.log("user id in create post: ", userPayLoad);
        const clubOwner = await Page.findOne({ where: { creatorId: userPayLoad?.userId } });

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
            creatorId: userPayLoad?.userId//get session id
        }).save();


        return { page }

        //club owners can only post one page

    }

    //delete Page
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePage(
        @Arg('id', () => String) id: string,
        @Ctx() context: MyContext
    ): Promise<Boolean> {
        const authorization = context.req.headers['authorization'];
        let user = '';
        if (!authorization) {
            return false;
        }
        const token = authorization.split(' ')[1];
        const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);

        await Page.delete({ id, creatorId: payload.userId }) // only deeltes Page by the user
        return true;
    }

}