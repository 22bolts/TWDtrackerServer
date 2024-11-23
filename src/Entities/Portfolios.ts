import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from 'typeorm';
import { Users } from './Users';
import { Applications } from './Applications';

@Entity()
export class Portfolios extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => Applications, application => application.portfolios, { nullable: true })
    application!: Applications;

    @Column()
    title!: string;

    @Column()
    description!: string;

    @Column()
    linkPlayStore!: string;

    @Column()
    linkAppleStore!: string;

    @Column('simple-array')
    images!: string[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;
}
