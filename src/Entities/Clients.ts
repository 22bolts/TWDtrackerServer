import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn } from 'typeorm';
import { Users } from './Users';

@Entity()
export class Clients extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userID!: number;

    @OneToOne(() => Users, (user) => user.client)
    @JoinColumn({ name: 'userID' })
    user!: Users;

    @Column({ nullable: true })
    phone!: string;
}