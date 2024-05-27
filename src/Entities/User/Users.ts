import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToOne } from 'typeorm';
import { Lecturers } from './Lecturers';
import { Students } from './Students';

@Entity()
export class Users extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    email!: string;

    @Column()
    password!: string;

    @Column()
    role!: string; // 'student' or 'teacher'

    @Column()
    firstName!: string;
    
    @Column()
    middleName!: string;

    @Column()
    lastName!: string;

    @OneToOne(() => Lecturers, lecturers => lecturers.user, { cascade: true })
    teacher!: Lecturers;

    @OneToOne(() => Students, student => student.user, { cascade: true })
    student!: Students;
}
