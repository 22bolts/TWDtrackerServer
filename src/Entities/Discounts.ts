import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class Discounts extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userID!: number; // Foreign Key referencing Users table

    @Column()
    discountPercentage!: number;

    @Column()
    startDate!: Date;

    @Column()
    endDate!: Date;
}
