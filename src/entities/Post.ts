import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Page } from "./Page";


@ObjectType()
@Entity()
export class Post extends BaseEntity {

    @Field()
    @PrimaryGeneratedColumn()
    id!: number; //string is also supported

    @Field()
    @Column()
    title!: string;

    @Field()
    @Column()
    text!: string;

    @Field()
    @Column()
    postCreatorId: number;

    @Field(() => String)
    @CreateDateColumn()
    createdAt!: Date;

    @Field(() => Page)
    @ManyToOne(() => Page, (page) => page.posts)
    postCreator: Page;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt!: Date;
}