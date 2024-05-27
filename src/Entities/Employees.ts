import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn } from 'typeorm';
import { Users } from './Users';

@Entity()
export class Employees extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userID!: number; // Foreign Key referencing Users table

    @OneToOne(() => Users, user => user.employee)
    @JoinColumn()
    user!: Users;

    @Column()
    department!: string;

    @Column()
    position!: string;

    @Column()
    managerID!: number; // If applicable, Foreign Key referencing Employees table for hierarchical structure

    @Column()
    salary!: number;
}
