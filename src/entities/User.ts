import { cp } from "fs";
import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @Column()
    password!: string;

    @Field(() => String)
    @CreateDateColumn()
    createdAt!: Date;

    @Field()
    @UpdateDateColumn()
    updatedAt!: Date;
}