import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { Incident } from '../incidents/incident.entity';
import { User } from '../users/user.entity';

@Entity('incident_confirmations')
@Index('idx_confirmations_user', ['userId'])
export class IncidentConfirmation {
  @PrimaryColumn({ name: 'incident_id', type: 'bigint', unsigned: true })
  incidentId!: string;

  @PrimaryColumn({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @CreateDateColumn({ name: 'confirmed_at', type: 'datetime', precision: 3 })
  confirmedAt!: Date;

  @ManyToOne(() => Incident, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'incident_id',
    foreignKeyConstraintName: 'fk_confirmations_incident',
  })
  incident?: Relation<Incident>;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_confirmations_user',
  })
  user?: Relation<User>;
}
