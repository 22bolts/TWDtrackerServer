import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, ManyToMany, OneToMany } from 'typeorm';
import { Users } from './Users';
import { Clients } from './Clients';
import { Sessions } from './Sessions';

@Entity()
export class Trainers extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    // @Column()
    // userID!: number; // Foreign Key referencing Users table
    
    @Column()
    gym!: string;

    @OneToOne(() => Users, user => user.employee)
    @JoinColumn()
    user!: Users;
    
    @ManyToMany(() => Clients, (client) => client.trainers)
    clients!: Clients[];

    @OneToMany(() => Sessions, (session) => session.trainer)
    sessions!: Sessions[];
}
