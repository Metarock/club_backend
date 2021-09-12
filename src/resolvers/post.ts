import { Post } from "../entities/Post";
import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, ObjectType, Query, Resolver, Root, UseMiddleware } from "type-graphql";
import { FieldError } from "../shared/FieldError";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import { isPostAuth } from "../middleware/isPostAuth";
import { Page } from "../entities/Page";
import { getConnection } from "typeorm";

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

    @FieldResolver(() => String)
    textSnippet(@Root() root: Post) {
        return root.text.slice(0, 50);
    }

    @Query(() => Post, { nullable: true })
    post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
        return Post.findOne(id);
    }

    //find all post
    @Query(() => [Post])
    //return an array of post
    async posts(): Promise<Post[]> {
        return Post.find({ relations: ['postCreator'] });
    }

    @FieldResolver(() => Page) // return page
    postCreator(
        @Root() post: Post,
        @Ctx() { postLoader }: MyContext
    ) {
        return postLoader.load(post.postCreatorId);
    }

    //create post
    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Ctx() { req }: MyContext,
        @Arg('input') input: PostInput,
        @Arg('postimgUrl', () => String, { nullable: true }) postimgUrl?: string,
    ): Promise<Post> {
        const clubOwner = await Page.findOne({ where: { creatorId: req.session.userId } });

        if (!clubOwner) throw new Error('not the owner of this page');

        return Post.create({
            ...input,
            postimgUrl: postimgUrl,
            postCreatorId: req.session.userId
        }).save();
    }

    @Mutation(() => Post, { nullable: true })
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg('id', () => Int) id: number,
        @Arg('title') title: string,
        @Arg('text') text: string,
        @Ctx() { req }: MyContext
    ): Promise<Post | null> {
        const result = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ title, text })
            .where('id = :id and "postCreatorId" = :postCreatorId', {
                id,
                postCreatorId: req.session.userId
            })
            .returning("*")
            .execute();
        //id is the condition
        return result.raw[0] as any;
    }

    //delete post
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async deletePost(@Arg('id', () => Int) id: number, @Ctx() { req }: MyContext): Promise<Boolean> {
        await Post.delete({ id, postCreatorId: req.session.userId })
        return true;
    }

}