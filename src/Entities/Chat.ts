import { Entity, PrimaryColumn, Column, BaseEntity, ManyToMany, JoinTable } from 'typeorm';
import { Users } from './Users';

@Entity()
export class Chat extends BaseEntity {
    @PrimaryColumn()
    id!: string;

    @Column()
    messageFilePath!: string; // Path to the JSON file where messages are stored

    @Column({nullable: true})
    last_message!: string; // Path to the JSON file where messages are stored

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ type: 'int', default: 0 })
    unreadMessageCount!: number;
}
