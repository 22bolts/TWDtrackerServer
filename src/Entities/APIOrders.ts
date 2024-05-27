import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class APIOrders extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userID!: number; // Foreign Key referencing Users table

    @Column()
    templateID!: number; // Foreign Key referencing APITemplates table

    @Column()
    orderDate!: Date;

    @Column()
    status!: string; // 'pending', 'in progress', 'completed', 'cancelled'

    @Column()
    customizationDetails!: string; // Additional customization details if needed

    @Column()
    discountID!: number; // Foreign Key referencing Discounts table
}
