import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity } from 'typeorm';

@Entity()
export class OTP extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @Column()
    otp!: string;
    
    @Column({ nullable: true })
    trainerEmail!: string; // Optional: tracks which trainer worked with the client

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ type: 'timestamp' })
    expiresAt!: Date;
}
