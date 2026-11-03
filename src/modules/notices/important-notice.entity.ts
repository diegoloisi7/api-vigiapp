import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from '../groups/group.entity';
import { User } from '../users/user.entity';

@Entity('avisos_importantes')
@Index('idx_avisos_grupo_vencimiento', ['groupId', 'deletedAt', 'expiresAt'])
@Index('idx_avisos_autor', ['createdByUserId'])
export class ImportantNotice {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'id_grupo', type: 'bigint', unsigned: true })
  groupId!: string;

  @Column({ name: 'id_usuario_creador', type: 'bigint', unsigned: true })
  createdByUserId!: string;

  @Column({ name: 'titulo', type: 'varchar', length: 200 })
  title!: string;

  @Column({ name: 'descripcion', type: 'text' })
  description!: string;

  @Column({ name: 'prioridad', type: 'varchar', length: 20, default: 'NORMAL' })
  priority!: 'NORMAL' | 'IMPORTANTE';

  @CreateDateColumn({ name: 'fecha_publicacion', type: 'datetime', precision: 3 })
  publishedAt!: Date;

  @Column({ name: 'fecha_vencimiento', type: 'datetime', precision: 3, nullable: true })
  expiresAt!: Date | null;

  @Column({ name: 'fecha_cierre', type: 'datetime', precision: 3, nullable: true })
  closedAt!: Date | null;

  @UpdateDateColumn({ name: 'fecha_actualizacion', type: 'datetime', precision: 3 })
  updatedAt!: Date;

  @Column({
    name: 'fecha_eliminacion',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  deletedAt!: Date | null;

  @ManyToOne(() => Group, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_grupo',
    foreignKeyConstraintName: 'fk_avisos_grupo',
  })
  group?: Relation<Group>;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_usuario_creador',
    foreignKeyConstraintName: 'fk_avisos_autor',
  })
  author?: Relation<User>;
}
