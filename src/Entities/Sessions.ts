import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity, ManyToOne, JoinColumn } from 'typeorm';
import { Clients } from './Clients';
import { Trainers } from './Trainers';

@Entity()
export class Sessions extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;
    
    @ManyToOne(() => Clients, (client) => client.sessions, { eager: true })
    @JoinColumn({ name: 'clientId' }) // Maps clientId to Clients entity
    client!: Clients;

    @ManyToOne(() => Trainers, (trainer) => trainer.sessions, { eager: true })
    @JoinColumn({ name: 'trainerId' }) // Maps trainerId to Trainers entity
    trainer!: Trainers;

    @Column()
    clientId!: number;

    @Column()
    trainerId!: number;

    @Column()
    email!: string;
    
    @Column()
    gym!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    startedAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt!: Date;

    @Column({ default: 'pending' }) // 'pending', 'active', 'completed'
    status!: string;

    @Column({ nullable: true })
    trainerEmail!: string; // Optional: tracks which trainer worked with the client
}
