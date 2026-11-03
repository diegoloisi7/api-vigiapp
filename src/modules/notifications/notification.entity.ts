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

@Entity('notificaciones')
@Index('idx_notificaciones_usuario_lectura', ['userId', 'readAt', 'createdAt'])
@Index('idx_notificaciones_incidente', ['incidentId'])
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'id_usuario', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({
    name: 'id_incidente',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  incidentId!: string | null;

  @Column({ name: 'tipo', type: 'varchar', length: 50 })
  type!: 'URGENT_INCIDENT';

  @Column({ name: 'titulo', type: 'varchar', length: 200 })
  title!: string;

  @Column({ name: 'mensaje', type: 'text' })
  message!: string;

  @Column({ name: 'fecha_lectura', type: 'datetime', precision: 3, nullable: true })
  readAt!: Date | null;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_usuario',
    foreignKeyConstraintName: 'fk_notificaciones_usuario',
  })
  user?: Relation<User>;

  @ManyToOne(() => Incident, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'id_incidente',
    foreignKeyConstraintName: 'fk_notificaciones_incidente',
  })
  incident?: Relation<Incident> | null;
}
