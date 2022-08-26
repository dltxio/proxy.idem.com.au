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

    @Column({ type: "timestamptz" })
    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: "timestamptz" })
    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    expoPushToken: string;

    @Column({ unique: true })
    publicKey: string;

    @Column({ type: "boolean", default: false })
    emailVerified: boolean;

    @Column({ nullable: true })
    emailVerificationCode: string;
}
