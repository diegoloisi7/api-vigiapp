import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
} from 'typeorm';
import { Group } from '../groups/group.entity';
import { User } from '../users/user.entity';

@Entity('invitaciones_grupo')
@Unique('uq_invitaciones_pendientes', [
  'groupId',
  'invitedUserId',
  'pendingMarker',
])
@Index('idx_invitaciones_destinatario_estado', [
  'invitedUserId',
  'status',
  'invitedAt',
])
@Index('idx_invitaciones_remitente', ['invitedByUserId'])
@Index('idx_invitaciones_grupo_estado', ['groupId', 'status'])
export class GroupInvitation {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'id_grupo', type: 'bigint', unsigned: true })
  groupId!: string;

  @Column({ name: 'id_usuario_invitado', type: 'bigint', unsigned: true })
  invitedUserId!: string;

  @Column({ name: 'id_usuario_invitador', type: 'bigint', unsigned: true })
  invitedByUserId!: string;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'PENDING' })
  status!: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REVOKED';

  @CreateDateColumn({ name: 'fecha_invitacion', type: 'datetime', precision: 3 })
  invitedAt!: Date;

  @Column({ name: 'fecha_cierre', type: 'datetime', precision: 3, nullable: true })
  closedAt!: Date | null;

  @Column({
    name: 'marcador_pendiente',
    type: 'tinyint',
    nullable: true,
    asExpression: "CASE WHEN estado = 'PENDING' THEN 1 ELSE NULL END",
    generatedType: 'STORED',
    insert: false,
    update: false,
    select: false,
  })
  pendingMarker!: number | null;

  @ManyToOne(() => Group, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_grupo',
    foreignKeyConstraintName: 'fk_invitaciones_grupo',
  })
  group?: Relation<Group>;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_usuario_invitado',
    foreignKeyConstraintName: 'fk_invitaciones_destinatario',
  })
  invitedUser?: Relation<User>;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_usuario_invitador',
    foreignKeyConstraintName: 'fk_invitaciones_remitente',
  })
  invitedByUser?: Relation<User>;
}
