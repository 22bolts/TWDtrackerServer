import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from 'typeorm';
import { Orders } from './Orders';

@Entity()
export class Services extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    price!: number;

    @Column()
    duration!: string;

    @OneToMany(() => Orders, order => order.service)
    orders!: Orders[];
}
