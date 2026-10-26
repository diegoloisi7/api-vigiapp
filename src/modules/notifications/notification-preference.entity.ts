import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  Relation,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('preferencias_notificaciones')
export class NotificationPreference {
  @PrimaryColumn({ name: 'id_usuario', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({ name: 'alertas_urgentes_habilitadas', type: 'boolean', default: true })
  urgentIncidentsEnabled!: boolean;

  @OneToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'id_usuario',
    foreignKeyConstraintName: 'fk_preferencias_usuario',
  })
  user?: Relation<User>;
}
