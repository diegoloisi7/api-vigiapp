import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('usuarios')
@Unique('uq_usuarios_correo', ['email'])
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'nombre', length: 100 })
  firstName!: string;

  @Column({ name: 'apellido', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  dni!: string | null;

  @Column({ name: 'correo_electronico', length: 191 })
  email!: string;

  @Column({ name: 'hash_contrasena', length: 255, select: false })
  passwordHash!: string;

  @Column({ name: 'direccion', type: 'varchar', length: 255, nullable: true })
  address!: string | null;

  @Column({
    name: 'latitud_domicilio',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  homeLatitude!: number | null;

  @Column({
    name: 'longitud_domicilio',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  homeLongitude!: number | null;

  @Column({ name: 'rol_aplicacion', type: 'varchar', length: 20, default: 'USER' })
  appRole!: 'USER' | 'ADMIN';

  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion', type: 'datetime', precision: 3 })
  updatedAt!: Date;
}
