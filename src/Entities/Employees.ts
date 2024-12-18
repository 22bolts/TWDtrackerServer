import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn } from 'typeorm';
import { Users } from './Users';

@Entity()
export class Employees extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    // @Column()
    // userID!: number; // Foreign Key referencing Users table

    @OneToOne(() => Users, user => user.employee)
    @JoinColumn()
    user!: Users;

    @Column()
    position!: string;

    @Column()
    salary!: number;
}
