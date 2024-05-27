import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class APITemplates extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    customizationLevel!: string; // 'basic', 'advanced', 'royalty'

    @Column()
    price!: number;

    @Column()
    templateLink!: string; // Link to the actual API template file
}
