import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class Instructors extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column()
    email!: string;

    @Column()
    expertise!: string; // Area of expertise of the instructor
}
