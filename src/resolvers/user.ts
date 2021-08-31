import * as argon2 from "argon2";
import { User } from "../entities/User";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { UsernamePasswordInput } from "../shared/UsernamePasswordInput";
import { MyContext } from "../types";
import { validateRegister } from "../utils/validateRegister";
import { getConnection } from "typeorm";
import { COOKIE_NAME } from "../shared/constants";
import { FieldError } from "../shared/FieldError";

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

    @Query(() => String)
    azureupdated() {
        return "azure is updated";
    }

    @Query(() => [User])
    //return an array of post
    async users(): Promise<User[]> {
        return User.find();
    }

    @Query(() => User, { nullable: true })

    async me(@Ctx() { req }: MyContext): Promise<User | undefined> {
        if (req.session.userId) {
            return User.findOne(req.session.userId);
        }
        return undefined //if not found
    }

    //login
    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> { //promise to return variable name user
        //verify if username or email exists
        const user = await User.findOne(usernameOrEmail.includes('@') ? { where: { email: usernameOrEmail } } : { where: { clubUsername: usernameOrEmail } });

        //if user is not found
        if (!user) {
            return {
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
                errors: [{
                    field: 'password',
                    message: 'inputted the wrong password'
                }]
            }
        }

        req.session.userId = user.id;

        console.log("user id (logged in): ", req.session.userId);

        return { user };
    }

    //registration
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

    //log out
    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {
        return new Promise((resolve) => req.session.destroy(err => {
            if (err) {
                console.log("error in logging out: ", err);
                resolve(false)
                return
            }
            console.log("logged out successfully");
            resolve(true);
            res.clearCookie(COOKIE_NAME);
        }))
    }

}