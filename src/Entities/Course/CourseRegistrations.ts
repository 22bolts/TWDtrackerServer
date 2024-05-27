import {
    Entity, PrimaryGeneratedColumn, ManyToOne, Column
} from 'typeorm';
import { Students } from '../User/Students';
import { Courses } from './Courses';

@Entity()
export class CourseRegistrations {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Students, student => student.courseRegistrations)
    student!: Students;

    @ManyToOne(() => Courses, course => course.courseRegistrations)
    course!: Courses;

    @Column()
    semester!: string;

    @Column()
    academicYear!: string;
}
