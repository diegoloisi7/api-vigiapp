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

@Entity('important_notices')
@Index('idx_notices_group_expiration', ['groupId', 'deletedAt', 'expiresAt'])
@Index('idx_notices_author', ['createdByUserId'])
export class ImportantNotice {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'group_id', type: 'bigint', unsigned: true })
  groupId!: string;

  @Column({ name: 'created_by_user_id', type: 'bigint', unsigned: true })
  createdByUserId!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @CreateDateColumn({ name: 'published_at', type: 'datetime', precision: 3 })
  publishedAt!: Date;

  @Column({ name: 'expires_at', type: 'datetime', precision: 3 })
  expiresAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt!: Date;

  @Column({
    name: 'deleted_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  deletedAt!: Date | null;

  @ManyToOne(() => Group, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'group_id',
    foreignKeyConstraintName: 'fk_notices_group',
  })
  group?: Relation<Group>;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'created_by_user_id',
    foreignKeyConstraintName: 'fk_notices_author',
  })
  author?: Relation<User>;
}
