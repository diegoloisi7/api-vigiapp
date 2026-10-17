import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('group_memberships')
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
}
