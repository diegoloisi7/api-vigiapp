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

@Entity('confirmaciones_incidentes')
@Index('idx_confirmaciones_usuario', ['userId'])
export class IncidentConfirmation {
  @PrimaryColumn({ name: 'id_incidente', type: 'bigint', unsigned: true })
  incidentId!: string;

  @PrimaryColumn({ name: 'id_usuario', type: 'bigint', unsigned: true })
  userId!: string;

  @CreateDateColumn({ name: 'fecha_confirmacion', type: 'datetime', precision: 3 })
  confirmedAt!: Date;

  @ManyToOne(() => Incident, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_incidente',
    foreignKeyConstraintName: 'fk_confirmaciones_incidente',
  })
  incident?: Relation<Incident>;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_usuario',
    foreignKeyConstraintName: 'fk_confirmaciones_usuario',
  })
  user?: Relation<User>;
}
