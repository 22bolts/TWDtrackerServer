import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { Orders } from './Orders';

@Entity()
export class Transactions extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    orderID!: number; // Foreign Key referencing Orders table

    @ManyToOne(() => Orders, order => order.transactions)
    @JoinColumn({ name: 'orderID' })
    order!: Orders;

    @Column()
    userID!: number; // Foreign Key referencing Users table

    @Column()
    transactionDate!: Date;

    @Column()
    amount!: number;

    @Column()
    paymentMethod!: string;

    @Column()
    status!: string; // 'pending', 'completed', 'failed', etc.
}
