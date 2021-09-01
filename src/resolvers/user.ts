import * as argon2 from "argon2";
import { User } from "../entities/User";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { UsernamePasswordInput } from "../shared/UsernamePasswordInput";
import { MyContext } from "../types";
import { validateRegister } from "../utils/validateRegister";
import { getConnection } from "typeorm";
import { COOKIE_NAME } from "../shared/constants";
import { FieldError } from "../shared/FieldError";
import { verify } from "jsonwebtoken";
import { sendRefreshToken } from "../services/sendRefreshToken";
import { createAccessToken } from "src/services/auth";

@ObjectType()
class UserResponse {
    @Field(() => String, { nullable: true })
    accessToken: string

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

    @Query(() => String)
    azureupdated() {
        return "azure is updated";
    }

    @Query(() => String)
    doubleChecking() {
        return "double checking it works";
    }

    @Query(() => [User])
    //return an array of post
    async users(): Promise<User[]> {
        return User.find();
    }

    @Query(() => User, { nullable: true })
    async me(@Ctx() context: MyContext) {
        const authorization = context.req.headers['authorization'];
        if (!authorization) {
            return null
        }
        try {
            const token = authorization.split(' ')[1];
            const payload: any = verify(token, process.env.ACCESS_TOKEN_SECRET!);

            return User.findOne(payload.userId)
        } catch (err) {
            console.log(err);
            return null
        }
    }

    //login
    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { res }: MyContext
    ): Promise<UserResponse> { //promise to return variable name user
        //verify if username or email exists
        const user = await User.findOne(usernameOrEmail.includes('@') ? { where: { email: usernameOrEmail } } : { where: { clubUsername: usernameOrEmail } });

        //if user is not found
        if (!user) {
            return {
                accessToken: '',
                errors: [{
                    field: 'usernameorEmail',
                    message: 'username does not exist'
                }]
            }
        }

        //validate password
        const valid = await argon2.verify(user.password, password);

        if (!valid) {
            return {
                accessToken: '',
                errors: [{
                    field: 'password',
                    message: 'inputted the wrong password'
                }]
            }
        }

        sendRefreshToken(res, createAccessToken(user));

        console.log("user id (logged in): ", user.id);

        return {
            accessToken: createAccessToken(user),
            user
        };
    }

    //registration
    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { res }: MyContext
    ): Promise<UserResponse> {
        const errors = validateRegister(options);

        if (errors) {
            return {
                accessToken: '',
                errors
            };
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
                    accessToken: '',
                    errors: [{
                        field: 'clubUsername',
                        message: 'club username already exists and taken'
                    }]
                }
            } //duplicate username error
        }

        console.log('club user name: ', user);
        console.log('club id', user.id);

        sendRefreshToken(res, createAccessToken(user));

        return {
            accessToken: createAccessToken(user),
            user
        };
    }

    //log out
    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {
        sendRefreshToken(res, "");
        return true;
    }

}