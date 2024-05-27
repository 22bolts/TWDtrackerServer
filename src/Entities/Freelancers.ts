import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn } from 'typeorm';
import { Users } from './Users';

@Entity()
export class Freelancers extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userID!: number; // Foreign Key referencing Users table

    @OneToOne(() => Users, user => user.freelancer)
    @JoinColumn()
    user!: Users;

    @Column("text", { array: true, nullable: true })
    skills!: string[] | null; // Store skills as JSON array

    @Column()
    portfolio_Link!: string;

    @Column()
    availabilityStatus!: string; // 'available', 'busy'

    @Column()
    hourly_Rate!: number;
}
