import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany, JoinTable } from 'typeorm';
import { Users } from './Users';
import { Applications } from './Applications';

@Entity()
export class Projects extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    projectName!: string;

    @Column()
    description!: string;

    @Column()
    startDate!: Date;

    @Column()
    endDate!: Date;

    @Column()
    status!: string;

    @Column()
    tags!: string;
    
    @Column({ nullable: true })
    progress!: number;

    @Column()
    budget!: number;

    @Column()
    skills!: string;

    @Column({ nullable: true })
    attachments!: string;

    @Column()
    projectType!: string;

    @Column()
    visibility!: string;

    @OneToMany(() => Applications, application => application.project)
    @JoinTable()
    applications!: Applications[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;
}
