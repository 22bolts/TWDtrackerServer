import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, OneToMany, ManyToMany, JoinColumn } from 'typeorm';
import { Clients } from './Clients';
import { Employees } from './Employees';
import { Trainers } from './Trainers';

@Entity()
export class Users extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column({ nullable: true })
    hashedPin!: string;

    @Column()
    password!: string;

    @Column({ nullable: true })
    phone_number!: string;

    @Column()
    role!: string; // 'client', 'employee', 'freelancer'

    @Column({ nullable: true })
    full_name!: string;

    @Column({ nullable: true })
    avatar!: string;

    @Column({ type: 'json', default: {} })
    unreadMessages!: { [chatId: string]: number };

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at!: Date;

    @OneToOne(() => Employees, (employees) => employees.user)
    employee!: Employees;

    @OneToOne(() => Clients, (clients) => clients.user)
    client!: Clients;

    @OneToOne(() => Trainers, (trainers) => trainers.user)
    trainer!: Trainers;
}