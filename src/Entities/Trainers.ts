import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Users } from './Users';
import { Clients } from './Clients';

@Entity()
export class Trainers extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    // @Column()
    // userID!: number; // Foreign Key referencing Users table

    @OneToOne(() => Users, user => user.employee)
    @JoinColumn()
    user!: Users;
    
    @ManyToMany(() => Clients, (client) => client.trainers)
    clients!: Clients[];
}
