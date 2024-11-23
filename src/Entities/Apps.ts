// src/entities/Apps.ts
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from 'typeorm';
import { Users } from './Users';

@Entity()
export class Apps extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @ManyToOne(() => Users, user => user.apps)
    user!: Users;
}
