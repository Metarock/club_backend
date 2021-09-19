import * as argon2 from "argon2";
import { User } from "../entities/User";
import { Arg, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql";
import { UsernamePasswordInput } from "../shared/UsernamePasswordInput";
import { v4 } from "uuid";
import { MyContext } from "../types";
import { validateRegister } from "../utils/validateRegister";
import { getConnection } from "typeorm";
import { FieldError } from "../shared/FieldError";
import { sendEmail } from "../utils/sendEmail";
import { isAuth } from "../middleware/isAuth";

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
    async me(@Ctx() { req }: MyContext) {
        if (!req.session.userId) {
            return null; //if not found
        }
        return User.findOne(req.session.userId);
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
            console.log("error in login, user not found", user);
            return {
                errors: [{
                    field: 'usernameOrEmail',
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
        req.session.pageId = req.session.userId;

        console.log("user id (logged in): ", req.session.userId);
        console.log("page id", req.session.pageId)
        return { user };
    }

    //registration
    @Mutation(() => UserResponse)
    async register(
        @Ctx() { req }: MyContext,
        @Arg('options') options: UsernamePasswordInput,
        @Arg('userAvatar', () => String, { nullable: true }) userAvatar?: string,
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
                        clubName: options.clubName,
                        userAvatar: userAvatar
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
                        field: 'email' || 'clubUsername',
                        message: 'email or club username already exists and taken'
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

    //Update user details
    @Mutation(() => User, { nullable: true })
    @UseMiddleware(isAuth)
    async editProfile(
        @Arg('id', () => Int) id: number,
        @Arg('clubUsername') clubUsername: string,
        @Arg('clubName') clubName: string,
        @Arg('university') university: string,
        @Arg('email') email: string,
        @Arg('userAvatar', () => String, { nullable: true }) userAvatar?: string,
    ): Promise<User | null> {
        const user = await getConnection()
            .createQueryBuilder()
            .update(User)
            .set({ clubUsername, clubName, university, email, userAvatar })
            .where('id = :id', {
                id
            })
            .returning("*")
            .execute();
        //id is the condition here for user to update
        return user.raw[0] as any
    }

    @Mutation(() => UserResponse)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            //if user's email is not in the database
            return {
                errors: [{
                    field: 'email',
                    message: 'email does not exist'
                }]
            }
        }

        const token = v4();

        await redis.set(
            process.env.FORGOT_PASSWORD_PREFIX + token,
            user.id,
            'ex',
            1000 * 60 * 60 * 24 * 3
        ); //three days to change password
        await sendEmail(email, `<a href="${process.env.CORS_ORIGIN}/change-password/${token}">reset password</a>`);
        return { user };
    }

    //change passworsd
    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Ctx() { redis, req }: MyContext
    ): Promise<UserResponse> {
        if (newPassword.length <= 5) {
            return {
                errors: [
                    {
                        field: 'newPassword',
                        message: 'length must be greater than 5'
                    }
                ]
            }
        }

        //check if toke is valid, redis is used to identify 
        const key = process.env.FORGOT_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);

        //if token does not exist
        if (!userId) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'token expired'
                    }
                ]
            }
        }

        const userIdNum = parseInt(userId);
        //update the user details and password
        const user = await User.findOne(userIdNum);

        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: 'user does not exist'
                    }
                ]
            }
        }

        await User.update(
            { id: userIdNum },
            { password: await argon2.hash(newPassword) }
        );

        await redis.del(key);
        //Login user after changing password 
        req.session.userId = user.id;

        return { user };
    }

    //log out
    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {
        return new Promise((resolve) => req.session.destroy((err: any) => {
            if (err) {
                console.log("error in logging out: ", err);
                resolve(false)
                return
            }
            console.log("logged out successfully");
            resolve(true);
            res.clearCookie(process.env.COOKIE_NAME);
        }))
    }

}