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
import { User } from '../users/user.entity';

@Entity('grupos_vecinales')
@Index('idx_grupos_creador', ['createdByUserId'])
export class Group {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id!: string;
  @Column({ name: 'nombre', length: 100 }) name!: string;
  @Column({ name: 'descripcion', type: 'text', nullable: true }) description!: string | null;
  @Column({ name: 'latitud_centro', type: 'decimal', precision: 10, scale: 7 })
  centerLatitude!: number;
  @Column({
    name: 'longitud_centro',
    type: 'decimal',
    precision: 10,
    scale: 7,
  })
  centerLongitude!: number;
  @Column({ name: 'radio_metros', type: 'int', unsigned: true })
  radiusMeters!: number;
  @Column({ name: 'id_usuario_creador', type: 'bigint', unsigned: true })
  createdByUserId!: string;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime', precision: 3 })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'fecha_actualizacion', type: 'datetime', precision: 3 })
  updatedAt!: Date;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_usuario_creador',
    foreignKeyConstraintName: 'fk_grupos_vecinales_creador',
  })
  creator?: Relation<User>;
}
