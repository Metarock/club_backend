import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


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