import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn } from 'typeorm';
import { Users } from './Users';

@Entity()
export class Clients extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userID!: number; // Foreign Key referencing Users table

    @OneToOne(() => Users, user => user.client)
    @JoinColumn()
    user!: Users;

    @Column()
    companyName!: string;

    @Column()
    address!: string;
}
