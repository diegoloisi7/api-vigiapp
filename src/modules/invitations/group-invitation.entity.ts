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

@Entity('group_invitations')
@Unique('uq_invitations_one_pending', [
  'groupId',
  'invitedUserId',
  'pendingMarker',
])
@Index('idx_invitations_invited_status', [
  'invitedUserId',
  'status',
  'invitedAt',
])
@Index('idx_invitations_sender', ['invitedByUserId'])
@Index('idx_invitations_group_status', ['groupId', 'status'])
export class GroupInvitation {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'group_id', type: 'bigint', unsigned: true })
  groupId!: string;

  @Column({ name: 'invited_user_id', type: 'bigint', unsigned: true })
  invitedUserId!: string;

  @Column({ name: 'invited_by_user_id', type: 'bigint', unsigned: true })
  invitedByUserId!: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status!: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REVOKED';

  @CreateDateColumn({ name: 'invited_at', type: 'datetime', precision: 3 })
  invitedAt!: Date;

  @Column({ name: 'closed_at', type: 'datetime', precision: 3, nullable: true })
  closedAt!: Date | null;

  @Column({
    name: 'pending_marker',
    type: 'tinyint',
    nullable: true,
    asExpression: "CASE WHEN status = 'PENDING' THEN 1 ELSE NULL END",
    generatedType: 'STORED',
    insert: false,
    update: false,
    select: false,
  })
  pendingMarker!: number | null;

  @ManyToOne(() => Group, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'group_id',
    foreignKeyConstraintName: 'fk_invitations_group',
  })
  group?: Relation<Group>;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'invited_user_id',
    foreignKeyConstraintName: 'fk_invitations_invited',
  })
  invitedUser?: Relation<User>;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'invited_by_user_id',
    foreignKeyConstraintName: 'fk_invitations_sender',
  })
  invitedByUser?: Relation<User>;
}
