import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany, JoinTable, JoinColumn, ManyToMany } from 'typeorm';
import { Users } from './Users';
import { Projects } from './Projects';
import { Portfolios } from './Portfolios';

@Entity()
export class Applications extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;
    @JoinColumn({ name: 'userId' })
    user!: Users;

    @ManyToOne(() => Projects, project => project.applications)
    @JoinColumn({ name: 'projectId' })
    project!: Projects;

    @Column()
    message!: string;

    @ManyToMany(() => Portfolios)
    @JoinTable({
        name: 'application_portfolios',
        joinColumn: { name: 'applicationId', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'portfolioId', referencedColumnName: 'id' }
    })
    portfolios!: Portfolios[];

    @Column({ default: 'pending' })
    status!: string; // 'pending', 'accepted', 'rejected'
}
