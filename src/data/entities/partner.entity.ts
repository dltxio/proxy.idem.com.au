import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    CreateDateColumn
} from "typeorm";

@Entity("partners")
export class Partner {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column()
    email: string;

    @Column()
    tagLine: string;

    @Column()
    description: string;

    @Column()
    signup: string;

    @Column()
    backgroundColor: string;

    @Column()
    useProxy: boolean;

    @Column()
    tempPassword: boolean;

    @Column()
    verifyClaims: boolean;

    @Column({ type: "timestamptz" })
    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: "timestamptz" })
    @UpdateDateColumn()
    updatedAt: Date;
}
