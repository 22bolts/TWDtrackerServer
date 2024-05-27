import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
} from 'typeorm';
import { Courses } from './Courses';
import { CBTQuestions } from './CBTQuestions';
import { StudentCBTAttempts } from './StudentCBTAttempts';

@Entity()
export class CBT {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Courses, course => course.cbts)
    course!: Courses;

    @Column()
    startDate!: Date;

    @Column()
    endDate!: Date;

    @Column()
    duration!: number;

    @OneToMany(() => CBTQuestions, cbtQuestions => cbtQuestions.cbt)
    questions!: CBTQuestions[];

    @OneToMany(() => StudentCBTAttempts, studentCBTAttempts => studentCBTAttempts.cbt)
    attempts!: StudentCBTAttempts[];
}
