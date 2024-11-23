import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, CreateDateColumn } from 'typeorm';
import { Users } from './Users';

@Entity()
export class Notifications extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;
    
    @Column()
    message!: string;

    @Column({ default: false })
    read!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @ManyToOne(() => Users, user => user.notifications, { onDelete: 'CASCADE' })
    user!: Users;
}
