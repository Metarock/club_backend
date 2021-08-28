import * as argon2 from "argon2";
import { User } from "../entities/User";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

@Resolver(User)
export class UserResolver {

    @Query(() => String)
    hello() {
        return "hi";
    }

    @Query(() => [User])
    async users(): Promise<User[]> {
        return User.find();
    }

    //registration
    @Mutation(() => Boolean)
    async register(
        @Arg('email') email: string,
        @Arg('password') password: string,
    ) {
        const hashPassword = await argon2.hash(password);
        try {
            await User.insert({
                email,
                password: hashPassword
            });
        } catch (err) {
            console.log(err);
            return false
        }

        return true;
    }

}