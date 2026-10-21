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

@Entity('incidents')
@Index('idx_incidents_map', ['groupId', 'status', 'deletedAt', 'expiresAt'])
@Index('idx_incidents_group_created', ['groupId', 'createdAt'])
@Index('idx_incidents_author', ['createdByUserId'])
@Index('idx_incidents_category', ['categoryId'])
export class Incident {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id!: string;
  @Column({ name: 'group_id', type: 'bigint', unsigned: true })
  groupId!: string;
  @Column({ name: 'created_by_user_id', type: 'bigint', unsigned: true })
  createdByUserId!: string;
  @Column({
    name: 'category_id',
    type: 'bigint',
    unsigned: true,
    nullable: true,
  })
  categoryId!: string | null;
  @Column({ name: 'report_type', type: 'varchar', length: 20 }) reportType!:
    'STANDARD' | 'URGENT';
  @Column({ type: 'varchar', length: 200, nullable: true })
  title!: string | null;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ type: 'decimal', precision: 10, scale: 7 }) latitude!: number;
  @Column({ type: 'decimal', precision: 10, scale: 7 }) longitude!: number;
  @Column({ name: 'location_source', type: 'varchar', length: 20 })
  locationSource!: 'GPS' | 'HOME' | 'MANUAL';
  @Column({ name: 'is_anonymous', type: 'boolean', default: false })
  isAnonymous!: boolean;
  // Los estados todavía no están acordados; el DDL solo exige texto no vacío.
  @Column({ type: 'varchar', length: 30 }) status!: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt!: Date;
  @Column({ name: 'expires_at', type: 'datetime', precision: 3 })
  expiresAt!: Date;
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
    foreignKeyConstraintName: 'fk_incidents_group',
  })
  group?: Relation<Group>;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'created_by_user_id',
    foreignKeyConstraintName: 'fk_incidents_author',
  })
  author?: Relation<User>;

  @ManyToOne(() => Category, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'category_id',
    foreignKeyConstraintName: 'fk_incidents_category',
  })
  category?: Relation<Category> | null;
}
