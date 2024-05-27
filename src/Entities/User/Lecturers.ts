import { Entity, PrimaryColumn, Column, BaseEntity, OneToOne, JoinColumn, ManyToMany, ManyToOne, JoinTable } from 'typeorm';
import { Users } from './Users'; // Adjust the import path as needed
import { Departments } from './Departments'; // Adjust the import path as needed
import { Courses } from '../Course/Courses'; // Adjust the import path as needed

@Entity()
export class Lecturers extends BaseEntity {
    @PrimaryColumn({ type: "varchar", length: 15 }) // Ensure the length accommodates your ID format
    id!: string;

    @OneToOne(() => Users, user => user.teacher)
    @JoinColumn()
    user!: Users;

    @ManyToOne(() => Departments, department => department.lecturers)
    @JoinColumn({ name: 'departmentId' }) // This column in the Lecturers table points to the Department ID
    department!: Departments;

    @ManyToMany(() => Courses, course => course.lecturers)
    @JoinTable({
        name: 'lecturer_courses', // Specifies the name of the join table
        joinColumn: {
            name: 'lecturerId',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'courseId',
            referencedColumnName: 'id',
        },
    })
    courses!: Courses[];
}
