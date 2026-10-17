import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'first_name', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  dni!: string | null;

  @Column({ length: 191 })
  email!: string;

  @Column({ name: 'password_hash', length: 255, select: false })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address!: string | null;

  @Column({
    name: 'home_latitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  homeLatitude!: number | null;

  @Column({
    name: 'home_longitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  homeLongitude!: number | null;

  @Column({ name: 'app_role', type: 'varchar', length: 20, default: 'USER' })
  appRole!: 'USER' | 'ADMIN';

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt!: Date;
}
