import * as argon2 from "argon2";
import { User } from "../entities/User";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { UsernamePasswordInput } from "../shared/UsernamePasswordInput";
import { MyContext } from "../types";
import { validateRegister } from "../utils/validateRegister";
import { getConnection } from "typeorm";

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}


@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver(User)
export class UserResolver {

    @Query(() => String)
    hello() {
        return "hi there";
    }

    @Query(() => [User])
    //return an array of post
    async users(): Promise<User[]> {
        return User.find();
    }

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);

        if (errors) {
            return { errors };
        }

        const hashedPassword = await argon2.hash(options.password);
        let user;

        try {
            const result = await getConnection()
                .createQueryBuilder()
                .insert()
                .into(User)
                .values(
                    {
                        clubUsername: options.clubUsername,
                        password: hashedPassword,
                        email: options.email,
                        university: options.university,
                        clubName: options.clubName
                    }
                )
                .returning('*')
                .execute(); //allows connection globally
            console.log("result typeorm", result);
            user = result.raw[0] //get clubusername
        } catch (err) {
            console.log("error for register: ", err);

            if (err.code === "23505") {
                return {
                    errors: [{
                        field: 'clubUsername',
                        message: 'club username already exists and taken'
                    }]
                }
            } //duplicate username error
        }

        console.log('club user name: ', user);
        console.log('club id', user.id);

        req.session.userId = user.id; //set session

        console
        return { user };
    }

}