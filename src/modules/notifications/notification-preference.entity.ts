import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('notification_preferences')
export class NotificationPreference {
  @PrimaryColumn({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ name: 'urgent_incidents_enabled', type: 'boolean', default: true })
  urgentIncidentsEnabled!: boolean;

  @OneToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_preferences_user',
  })
  user?: Relation<User>;
}
