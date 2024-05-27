import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class APIUsers extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userID!: number; // Foreign Key referencing Users table

    @Column()
    apiType!: string; // 'basic', 'advanced', 'royalty'

    @Column()
    customizationDetails!: string; // Additional customization details if needed
}
