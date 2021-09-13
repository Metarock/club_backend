import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
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

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    postimgUrl!: string;

    @ManyToOne(() => Page, (page) => page.posts, { cascade: true })
    @JoinColumn()
    postCreator: Page;

    @Field(() => String)
    @CreateDateColumn()
    createdAt: Date;


    @Field(() => String)
    @UpdateDateColumn()
    updatedAt: Date;
}