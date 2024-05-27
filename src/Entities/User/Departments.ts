import { Entity, PrimaryColumn, Column, OneToMany, BaseEntity } from 'typeorm';
import { Lecturers } from './Lecturers';
import { Courses } from '../Course/Courses';
import { Students } from './Students'; // Make sure this path is correct

@Entity()
export class Departments extends BaseEntity {
    @PrimaryColumn({ type: "varchar", length: 8 })
    code!: string;

    @Column()
    name!: string;

    @Column()
    faculty!: string;

    @OneToMany(() => Lecturers, lecturers => lecturers.department)
    lecturers!: Lecturers[];

    @OneToMany(() => Courses, course => course.department)
    courses!: Courses[];

    // Add this property to link Departments to Students
    @OneToMany(() => Students, student => student.majorDepartment)
    students!: Students[];
}
