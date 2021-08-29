import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


//decorators
@ObjectType()
@Entity()
export class Post extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number; //string is also supported

    @Field()
    @Column({ type: 'text' })
    title!: string; //for club title

    @Field()
    @Column()
    text!: string;

    @Field()
    @Column()
    creatorId: number; //which club id posted it

    @Field(() => String)
    @CreateDateColumn()
    createdAt!: Date;

    @Field(() => String)
    @UpdateDateColumn()
    updatedAt!: Date;

}