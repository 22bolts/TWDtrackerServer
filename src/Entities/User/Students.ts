import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, ManyToOne, OneToMany, BaseEntity } from 'typeorm';
import { Users } from './Users';
import { Departments } from './Departments';
import { StudentCBTAttempts } from '../Course/StudentCBTAttempts'; // Make sure this path is correct
import { CourseRegistrations } from '../Course/CourseRegistrations';

@Entity()
export class Students extends BaseEntity {
    @PrimaryColumn()
    regNumber!: string;
    
    @Column()
    enrollmentYear!: number;

    @OneToOne(() => Users, user => user.student)
    @JoinColumn()
    user!: Users;

    @ManyToOne(() => Departments, department => department.students) // Ensure the inverse relationship is correctly defined in Departments
    majorDepartment!: Departments;

    @OneToMany(() => StudentCBTAttempts, studentCBTAttempts => studentCBTAttempts.student) // This defines the relationship
    cbtAttempts!: StudentCBTAttempts[]; // Make sure this property exists and is correctly typed

    @OneToMany(() => CourseRegistrations, courseRegistrations => courseRegistrations.student)
    courseRegistrations!: CourseRegistrations[];
}
