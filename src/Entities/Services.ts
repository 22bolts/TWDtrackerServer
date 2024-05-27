import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class Services extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    description!: string;

    @Column()
    type!: string; // 'basic', 'advanced', 'royalty'

    @Column()
    price!: number;

    @Column()
    royaltyLevels!: string; // If applicable, define the structure for royalty levels
}
