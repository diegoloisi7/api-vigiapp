import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('incidents')
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
  @Column({ type: 'varchar', length: 20, default: 'ACTIVE' }) status!:
    'ACTIVE' | 'RESOLVED' | 'DISMISSED';
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
}
