import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class Courses extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    description!: string;

    @Column()
    instructorID!: number; // Foreign Key referencing Instructors table

    @Column()
    duration!: number; // Duration of the course in hours or days

    @Column()
    price!: number;
}
