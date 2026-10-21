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

@Entity('group_memberships')
@Unique('uq_membership_user_group', ['userId', 'groupId'])
@Index('idx_memberships_group_role', ['groupId', 'groupRole'])
export class Membership {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id!: string;
  @Column({ name: 'user_id', type: 'bigint', unsigned: true }) userId!: string;
  @Column({ name: 'group_id', type: 'bigint', unsigned: true })
  groupId!: string;
  @Column({
    name: 'group_role',
    type: 'varchar',
    length: 20,
    default: 'NEIGHBOR',
  })
  groupRole!: 'GROUP_ADMIN' | 'NEIGHBOR';
  @CreateDateColumn({ name: 'joined_at', type: 'datetime', precision: 3 })
  joinedAt!: Date;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_memberships_user',
  })
  user?: Relation<User>;

  @ManyToOne(() => Group, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'group_id',
    foreignKeyConstraintName: 'fk_memberships_group',
  })
  group?: Relation<Group>;
}
