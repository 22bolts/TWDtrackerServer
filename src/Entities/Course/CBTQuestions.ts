import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne,
} from 'typeorm';
import { CBT } from './CBT';

@Entity()
export class CBTQuestions {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => CBT, cbt => cbt.questions)
    cbt!: CBT;

    @Column('text')
    questionText!: string;

    @Column()
    correctAnswer!: string;

    @Column()
    marks!: number;
}
