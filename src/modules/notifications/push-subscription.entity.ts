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
import { User } from '../users/user.entity';

// Tabla heredada del DDL v2. El MVP actual no implementa Web Push.
@Entity('suscripciones_push')
@Unique('uq_suscripciones_punto_acceso', ['endpoint'])
@Index('idx_suscripciones_usuario', ['userId'])
export class PushSubscription {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'id_usuario', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({
    name: 'punto_acceso',
    type: 'varchar',
    length: 1024,
    charset: 'ascii',
    collation: 'ascii_bin',
  })
  endpoint!: string;

  @Column({
    name: 'clave_p256dh',
    type: 'varchar',
    length: 255,
    charset: 'ascii',
    collation: 'ascii_bin',
  })
  p256dhKey!: string;

  @Column({
    name: 'clave_autenticacion',
    type: 'varchar',
    length: 255,
    charset: 'ascii',
    collation: 'ascii_bin',
  })
  authKey!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'id_usuario',
    foreignKeyConstraintName: 'fk_suscripciones_usuario',
  })
  user?: Relation<User>;
}
