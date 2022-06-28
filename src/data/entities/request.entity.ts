import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn
} from "typeorm";

@Entity("requests")
export class Request {
    @PrimaryGeneratedColumn()
    id: number;

    //Example: GPIB,Coinstash
    @Column()
    from: string;

    //Example: Idem
    @Column()
    to: string;

    @Column()
    ipAddress: string;

    //Example: Signup, verify
    @Column()
    requestType: string;

    @Column({ type: "timestamptz" })
    @CreateDateColumn()
    createdAt: Date;
}
