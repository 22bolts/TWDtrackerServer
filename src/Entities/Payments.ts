import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Sessions } from './Sessions';

@Entity()
export class Payments extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    sessionId!: number;

    @ManyToOne(() => Sessions)
    @JoinColumn({ name: 'sessionId' })
    session!: Sessions;

    @Column()
    clientId!: number;

    @Column()
    trainerId!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @Column({ default: 'USD' })
    currency!: string;

    @Column()
    gym!: string;

    @Column({ default: 'square_pos' })
    paymentMethod!: string;

    @Column({ nullable: true })
    squarePaymentId!: string;

    @Column({ default: 'pending' })
    status!: string; // pending, completed, failed, refunded

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    processedAt!: Date;

    @Column({ type: 'jsonb', nullable: true })
    squareData!: any; // Store Square's payment response

    @Column({ nullable: true })
    note?: string;
}