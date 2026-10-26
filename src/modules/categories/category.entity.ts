import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('categorias_incidentes')
@Unique('uq_categorias_nombre', ['name'])
export class Category {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id!: string;
  @Column({ name: 'nombre', length: 100 }) name!: string;
  @Column({ name: 'descripcion', type: 'text', nullable: true }) description!: string | null;
  @Column({ name: 'icono', type: 'varchar', length: 100, nullable: true })
  icon!: string | null;
  @Column({ name: 'activa', type: 'boolean', default: true }) active!: boolean;
}
