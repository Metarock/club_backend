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

    @Field({ nullable: true })
    @Column({ type: 'text' })
    university: string;

    @Field({ nullable: true })
    @Column({ unique: true })
    clubUsername: string;

    @Field({ nullable: true })
    @Column({ type: 'text' })
    clubName: string;

    @OneToOne(() => Page, page => page.creator)
    page: Page;

    @Column()
    password!: string;

    @Field(() => String)
    @CreateDateColumn()
    createdAt!: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt!: Date;
}