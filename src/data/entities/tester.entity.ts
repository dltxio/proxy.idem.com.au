import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn
} from "typeorm";

@Entity("testers")
export class Tester {
    @PrimaryGeneratedColumn()
    testerId: number;

    @Column({ unique: true })
    email: string;

    @Column({ unique: false })
    firstName: string;

    @Column({ unique: false })
    lastName: string;

    @Column({ type: "timestamptz" })
    @CreateDateColumn()
    createdAt: Date;
}
