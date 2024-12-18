import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Users } from './Users';
import { Trainers } from './Trainers';

@Entity()
export class Clients extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    // @Column()
    // userID!: number;

    @OneToOne(() => Users, (user) => user.client)
    @JoinColumn({ name: 'userID' })
    user!: Users;

    @Column({ nullable: true })
    phone!: string;
    
    // @ManyToMany(() => Trainers, (trainer) => trainer.clients)
    // @JoinColumn({ name: 'trainer_id' })
    // trainers!: Trainers[];

    @ManyToMany(() => Trainers, (trainer) => trainer.clients)
    @JoinTable({
        name: 'client_trainer',
        joinColumn: { name: 'client_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'trainer_id', referencedColumnName: 'id' },
    })
    trainers!: Trainers[];
}