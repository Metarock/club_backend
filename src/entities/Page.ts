import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./Post";
import { User } from "./User";


//decorators
@ObjectType()
@Entity()
export class Page extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number; //string is also supported

    @Field()
    @Column({ type: 'text' })
    pageTitle!: string; //for club title

    @Field()
    @Column()
    pageText!: string;

    @Field()
    @Column()
    aboutUs!: string;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    pageimgUrl!: string;

    @OneToMany(() => Post, post => post.postCreator)
    posts: Post[];

    @Field()
    @Column()
    creatorId: number; //which club id posted it

    @Field(() => User)
    @OneToOne(() => User, creator => creator.page)
    @JoinColumn()
    creator: User;

    @Field(() => String)
    @CreateDateColumn()
    createdAt!: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt!: Date;

}