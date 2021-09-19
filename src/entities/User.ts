import { cp } from "fs";
import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Page } from "./Page";

@ObjectType()
@Entity()
export class User extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @Field()
    @Column({ unique: true })
    email!: string;

    @Field()
    @Column({ type: 'text' })
    university: string;

    @Field()
    @Column({ unique: true })
    clubUsername: string;

    @Field()
    @Column({ type: 'text' })
    clubName: string;

    @OneToOne(() => Page, page => page.creator)
    page: Page;

    @Field(() => String, { nullable: true })
    @Column({ nullable: true })
    userAvatar!: string;

    @Column()
    password!: string;

    @Field(() => String)
    @CreateDateColumn()
    createdAt!: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt!: Date;
}