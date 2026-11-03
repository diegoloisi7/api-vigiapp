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
import { Category } from '../categories/category.entity';
import { Group } from '../groups/group.entity';
import { User } from '../users/user.entity';

@Entity('incidentes')
@Index('idx_incidentes_mapa', ['groupId', 'status', 'deletedAt', 'expiresAt'])
@Index('idx_incidentes_grupo_creacion', ['groupId', 'createdAt'])
@Index('idx_incidentes_autor', ['createdByUserId'])
@Index('idx_incidentes_categoria', ['categoryId'])
export class Incident {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id!: string;
  @Column({ name: 'id_grupo', type: 'bigint', unsigned: true })
  groupId!: string;
  @Column({ name: 'id_usuario_creador', type: 'bigint', unsigned: true })
  createdByUserId!: string;
  @Column({
    name: 'id_categoria',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  categoryId!: string | null;
  @Column({ name: 'tipo_reporte', type: 'varchar', length: 20 }) reportType!:
    'STANDARD' | 'URGENT';
  @Column({ name: 'titulo', type: 'varchar', length: 200, nullable: true })
  title!: string | null;
  @Column({ name: 'descripcion', type: 'text', nullable: true }) description!: string | null;
  @Column({ name: 'etiqueta_ubicacion', type: 'varchar', length: 255, nullable: true })
  locationLabel!: string | null;
  @Column({ name: 'latitud', type: 'decimal', precision: 10, scale: 7 }) latitude!: number;
  @Column({ name: 'longitud', type: 'decimal', precision: 10, scale: 7 }) longitude!: number;
  @Column({ name: 'origen_ubicacion', type: 'varchar', length: 20 })
  locationSource!: 'GPS' | 'HOME' | 'MANUAL';
  @Column({ name: 'es_anonimo', type: 'boolean', default: false })
  isAnonymous!: boolean;
  // Los estados todavía no están acordados; el DDL solo exige texto no vacío.
  @Column({ name: 'estado', type: 'varchar', length: 30 }) status!: string;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime', precision: 3 })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion', type: 'datetime', precision: 3 })
  updatedAt!: Date;
  @Column({ name: 'fecha_vencimiento', type: 'datetime', precision: 3 })
  expiresAt!: Date;
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
    foreignKeyConstraintName: 'fk_incidentes_grupo',
  })
  group?: Relation<Group>;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_usuario_creador',
    foreignKeyConstraintName: 'fk_incidentes_autor',
  })
  author?: Relation<User>;

  @ManyToOne(() => Category, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_categoria',
    foreignKeyConstraintName: 'fk_incidentes_categoria',
  })
  category?: Relation<Category> | null;
}
