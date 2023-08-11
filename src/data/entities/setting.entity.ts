import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    CreateDateColumn
} from "typeorm";

@Entity("settings")
export class Setting {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    key: string;

    @Column()
    value: string;

    @Column({ type: "timestamptz" })
    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: "timestamptz" })
    @UpdateDateColumn()
    updatedAt: Date;
}
