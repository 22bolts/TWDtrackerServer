import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from 'typeorm';
import { Transactions } from './Transactions';

@Entity()
export class Orders extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userID!: number; // Foreign Key referencing Users table

    @Column()
    serviceID!: number; // Foreign Key referencing Services table

    @Column()
    orderDate!: Date;

    @Column()
    status!: string; // 'pending', 'in progress', 'completed', 'cancelled'

    @Column()
    totalPrice!: number;
    
    @Column()
    balance!: number;

    @Column({ nullable: true }) // Make the 'level' column nullable
    level!: string;

    @Column()
    orderType!: string; // 'freelancing', 'company'

    @Column({ nullable: true })
    employeeID!: number; // Foreign Key referencing Employees table, nullable for freelancing orders

    @Column({ nullable: true })
    freelancerID!: number; // Foreign Key referencing Freelancers table, nullable for company orders

    @Column({ nullable: true })
    completionDate!: Date; // Add completion date column

    @OneToMany(() => Transactions, transaction => transaction.order)
    transactions!: Transactions[];
}
