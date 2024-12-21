// PasswordOTP.ts
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class PasswordOTP extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userId!: number; // Changed from clientId to userId to work with all user types

    @Column()
    email!: string; // Changed from clientEmail to be more generic

    @Column()
    otp!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ type: 'timestamp' })
    expiresAt!: Date;
}