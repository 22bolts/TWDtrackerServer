// src/entities/Transactions.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Users } from './Users';
import { Orders } from './Orders';

@Entity()
export class Transactions extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;
    // @PrimaryColumn()
    // id!: number;

    @Column()
    amount!: number;

    @Column()
    payment_method!: string;

    @Column()
    status!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column()
    userID!: number; // Foreign Key referencing Users table
    
    @Column()
    paymentReference!: string;

    @Column({ nullable: true })
    orderID!: number; // Foreign Key referencing Orders table
    
    @Column()
    subscriptionId!: number; // Foreign Key referencing Orders table
    @ManyToOne(() => Orders, order => order.transactions, { nullable: true })
    order!: Orders;
}
