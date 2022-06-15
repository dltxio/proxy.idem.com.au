import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    CreateDateColumn
} from "typeorm";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    userId: string;

    @Column({ unique: true })
    email: string;

    @Column({ default: false })
    emailVerified: boolean;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    dob: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ default: false })
    phoneNumberVerified: boolean;

    @Column({ type: "timestamptz" })
    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: "timestamptz" })
    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    address: string;

    @Column({ default: false })
    idVerified: boolean;

    @Column({ nullable: true })
    expoPushToken: string;
}
