import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity, OneToMany, ManyToMany } from 'typeorm';
import { Departments } from '../User/Departments';
import { Lecturers } from '../User/Lecturers';
import { CBT } from './CBT';
import { CourseRegistrations } from './CourseRegistrations';

@Entity()
export class Courses extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    title!: string;

    @Column()
    code!: string;

    @Column()
    creditLoad!: number;

    @ManyToOne(() => Departments, department => department.courses)
    department!: Departments;

    @ManyToMany(() => Lecturers, lecturer => lecturer.courses)
    lecturers!: Lecturers[];

    @OneToMany(() => CBT, cbt => cbt.course)
    cbts!: CBT[];

    @OneToMany(() => CourseRegistrations, courseRegistrations => courseRegistrations.course)
    courseRegistrations!: CourseRegistrations[];
}
