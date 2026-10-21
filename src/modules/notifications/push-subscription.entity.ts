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
@Entity('push_subscriptions')
@Unique('uq_push_subscriptions_endpoint', ['endpoint'])
@Index('idx_push_subscriptions_user', ['userId'])
export class PushSubscription {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true })
  userId!: string;

  @Column({
    type: 'varchar',
    length: 1024,
    charset: 'ascii',
    collation: 'ascii_bin',
  })
  endpoint!: string;

  @Column({
    name: 'p256dh_key',
    type: 'varchar',
    length: 255,
    charset: 'ascii',
    collation: 'ascii_bin',
  })
  p256dhKey!: string;

  @Column({
    name: 'auth_key',
    type: 'varchar',
    length: 255,
    charset: 'ascii',
    collation: 'ascii_bin',
  })
  authKey!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_push_subscriptions_user',
  })
  user?: Relation<User>;
}
