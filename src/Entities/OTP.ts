import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, BaseEntity } from 'typeorm';

@Entity()
export class OTP extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    clientId!: number;

    @Column()
    clientEmail!: string;

    @Column()
    otp!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @Column({ type: 'timestamp' })
    expiresAt!: Date;
}
