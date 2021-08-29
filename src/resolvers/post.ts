import { Post } from "../entities/Post";
import { Arg, Ctx, Field, InputType, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput {
    @Field()
    title: string;
    @Field()
    text: string;
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[]
    @Field()
    hasMore: boolean
}

@Resolver(Post)
export class PostResolver {


    //find all post
    @Query(() => [Post])
    //return an array of post
    async posts(): Promise<Post[]> {
        return Post.find();
    }

    //find a post
    @Query(() => Post, { nullable: true })
    post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
        return Post.findOne(id);
    }

    //create post
    @Mutation(() => Post)
    @UseMiddleware(isAuth) //authentication for posting first
    async createPost(
        @Arg('input') input: PostInput,
        @Ctx() { req }: MyContext
    ): Promise<Post> {

        return Post.create({
            ...input,
            creatorId: req.session.userId //get session id
        }).save();
    }

    //delete post
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg('id', () => Int) id: number,
        @Ctx() { req }: MyContext
    ): Promise<Boolean> {
        await Post.delete({ id, creatorId: req.session.userId }) // only deeltes posts by the user
        return true;
    }

}