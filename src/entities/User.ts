import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ObjectIdColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";



@ObjectType()
@Entity('user')
export class User extends BaseEntity {

    @Field()
    @ObjectIdColumn()
    _id: string;

    @Field()
    @PrimaryColumn()
    id: string;

    @Field()
    @Column({ unique: true })
    username!: string;

    @Field()
    @Column({ unique: true })
    email!: string;

    //allowing users to select password as it will be hashed
    @Column()
    password!: string;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}