import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany } from 'typeorm';
import { Users } from './Users';
import { Services } from './Services';
import { Transactions } from './Transactions';

@Entity()
export class Orders extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    service_type!: string;

    @Column()
    description!: string;

    @Column()
    status!: string;

    @Column()
    total_amount!: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    @ManyToOne(() => Users, user => user.orders)
    user!: Users;

    @ManyToOne(() => Services, service => service.orders)
    service!: Services;

    @OneToMany(() => Transactions, transaction => transaction.order)
    transactions!: Transactions[];
}
