import {
    Entity, PrimaryGeneratedColumn, ManyToOne, Column,
} from 'typeorm';
import { Students } from '../User/Students';
import { CBT } from './CBT';

@Entity()
export class StudentCBTAttempts {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Students, student => student.cbtAttempts)
    student!: Students;

    @ManyToOne(() => CBT, cbt => cbt.attempts)
    cbt!: CBT;

    @Column()
    attemptDate!: Date;

    @Column()
    score!: number;
}
