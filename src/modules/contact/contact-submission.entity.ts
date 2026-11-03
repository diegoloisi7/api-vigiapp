import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('mensajes_contacto')
@Index('idx_contacto_creacion', ['createdAt'])
export class ContactSubmission {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  name!: string;

  @Column({ name: 'correo_electronico', type: 'varchar', length: 191 })
  email!: string;

  @Column({ name: 'mensaje', type: 'text' })
  message!: string;

  @Column({ name: 'asunto', type: 'varchar', length: 150, nullable: true })
  subject!: string | null;

  @Column({ name: 'fecha_lectura', type: 'datetime', precision: 3, nullable: true })
  readAt!: Date | null;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime', precision: 3 })
  createdAt!: Date;
}
