import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne } from 'typeorm';
import { Clients } from './Clients';
import { Employees } from './Employees';
import { Freelancers } from './Freelancers';

@Entity()
export class Users extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @Column()
    password!: string;

    @Column({ nullable: true })
    phone_number!: string;

    @Column()
    role!: string; // 'client', 'employee', 'freelancer'

    @Column()
    usertag!: string;

    @Column()
    first_name!: string;

    @Column()
    middle_name!: string;

    @Column()
    last_name!: string;

    @Column({ nullable: true })
    avatar!: string;

    @Column()
    status!: string;

    @OneToOne(() => Clients, clients => clients.user, { cascade: true })
    client!: Clients;

    @OneToOne(() => Employees, employees => employees.user, { cascade: true })
    employee!: Employees;

    @OneToOne(() => Freelancers, freelancers => freelancers.user, { cascade: true })
    freelancer!: Freelancers;
}