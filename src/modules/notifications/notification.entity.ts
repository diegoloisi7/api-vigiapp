import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Incident } from '../incidents/incident.entity';
import { User } from '../users/user.entity';

@Entity('notifications')
@Index('idx_notifications_user_read', ['userId', 'readAt', 'createdAt'])
@Index('idx_notifications_incident', ['incidentId'])
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({
    name: 'incident_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  incidentId!: string | null;

  @Column({ type: 'varchar', length: 50 })
  type!: 'URGENT_INCIDENT';

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ name: 'read_at', type: 'datetime', precision: 3, nullable: true })
  readAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_notifications_user',
  })
  user?: Relation<User>;

  @ManyToOne(() => Incident, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'incident_id',
    foreignKeyConstraintName: 'fk_notifications_incident',
  })
  incident?: Relation<Incident> | null;
}
