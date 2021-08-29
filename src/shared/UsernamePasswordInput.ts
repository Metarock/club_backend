import { Field, InputType } from "type-graphql";

//another way to do args

@InputType()
export class UsernamePasswordInput {
    @Field()
    email: string;
    @Field()
    clubUsername: string;
    @Field(() => String)
    password: string;

    @Field()
    university: string;

    @Field()
    clubName: string;
}
