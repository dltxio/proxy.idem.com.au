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

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ type: "timestamptz" })
    @CreateDateColumn()
    createdAt: Date;
}
