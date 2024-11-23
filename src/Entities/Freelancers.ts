import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn } from 'typeorm';
import { Users } from './Users';

@Entity()
export class Freelancers extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userID!: number; // Foreign Key referencing Users table

    @Column("text", { array: true, nullable: true })
    skills!: string[] | null; // Store skills as JSON array

    @Column({ nullable: true })
    portfolio_Link!: string;

    @Column({ nullable: true })
    availabilityStatus!: string; // 'available', 'busy'

    @Column()
    hourly_Rate!: number;
}
