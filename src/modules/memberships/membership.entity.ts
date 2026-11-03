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

@Entity('membresias_grupo')
@Unique('uq_membresias_usuario_grupo', ['userId', 'groupId'])
@Index('idx_membresias_grupo_rol', ['groupId', 'groupRole'])
export class Membership {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id!: string;
  @Column({ name: 'id_usuario', type: 'bigint', unsigned: true }) userId!: string;
  @Column({ name: 'id_grupo', type: 'bigint', unsigned: true })
  groupId!: string;
  @Column({
    name: 'rol_grupo',
    type: 'varchar',
    length: 20,
    default: 'NEIGHBOR',
  })
  groupRole!: 'GROUP_ADMIN' | 'NEIGHBOR';
  @CreateDateColumn({ name: 'fecha_ingreso', type: 'datetime', precision: 3 })
  joinedAt!: Date;

  @ManyToOne(() => User, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_usuario',
    foreignKeyConstraintName: 'fk_membresias_usuario',
  })
  user?: Relation<User>;

  @ManyToOne(() => Group, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_grupo',
    foreignKeyConstraintName: 'fk_membresias_grupo',
  })
  group?: Relation<Group>;
}
