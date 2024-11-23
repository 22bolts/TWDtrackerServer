import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, ManyToOne } from 'typeorm';
import { Users } from './Users';

@Entity()
export class Subscriptions extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column()
    phoneNumber!: string;

    @Column()
    subscriptionPlan!: string;

    @Column()
    paymentReference!: string;

    @Column({ default: 'active' })
    status!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    @OneToOne(() => Users, user => user.subscription)
    user!: Users;
}
