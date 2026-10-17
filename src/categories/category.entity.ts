import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('incident_categories')
export class Category {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id!: string;
  @Column({ length: 100 }) name!: string;
  @Column({ type: 'text', nullable: true }) description!: string | null;
  @Column({ type: 'varchar', length: 100, nullable: true })
  icon!: string | null;
}
