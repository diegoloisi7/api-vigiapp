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

@Entity('neighborhood_groups')
@Index('idx_groups_creator', ['createdByUserId'])
export class Group {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id!: string;
  @Column({ length: 100 }) name!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ name: 'center_latitude', type: 'decimal', precision: 10, scale: 7 })
  centerLatitude!: number;
  @Column({
    name: 'center_longitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
  })
  centerLongitude!: number;
  @Column({ name: 'radius_meters', type: 'int', unsigned: true })
  radiusMeters!: number;
  @Column({ name: 'created_by_user_id', type: 'bigint', unsigned: true })
  createdByUserId!: string;
  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt!: Date;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'created_by_user_id',
    foreignKeyConstraintName: 'fk_groups_creator',
  })
  creator?: Relation<User>;
}
