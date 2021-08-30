import { Post } from "../entities/Post";
import { Arg, Ctx, Field, InputType, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
import { FieldError } from "../shared/FieldError";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { isPostAuth } from "../middleware/isPostAuth";

@InputType()
class PostInput {
    @Field()
    title: string;

    @Field()
    text: string;
}

@ObjectType()
class PostResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => Post, { nullable: true })
    post?: Post
}


@Resolver(Post)
export class PostResolver {

    @Query(() => Post, { nullable: true })
    post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
        return Post.findOne(id);
    }

    //create post
    @Mutation(() => Post)
    @UseMiddleware(isPostAuth)
    async createPost(@Arg('input') input: PostInput, @Ctx() { req }: MyContext): Promise<Post> {
        return Post.create({
            ...input,
            postCreatorId: req.session.pageId
        }).save();
    }

    //delete post
    @Mutation(() => Boolean)
    @UseMiddleware(isPostAuth)
    async deletePost(@Arg('id', () => Int) id: number, @Ctx() { req }: MyContext): Promise<Boolean> {
        await Post.delete({ id, postCreatorId: req.session.pageId })
        return true;
    }

}