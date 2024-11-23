import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity } from 'typeorm';

@Entity()
export class Sessions extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;
    
    @Column()
    clientId!: number;

    @Column()
    trainerId!: number;

    @Column()
    email!: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    startedAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt!: Date;

    @Column({ default: 'pending' }) // 'pending', 'active', 'completed'
    status!: string;

    @Column({ nullable: true })
    trainerEmail!: string; // Optional: tracks which trainer worked with the client
}
