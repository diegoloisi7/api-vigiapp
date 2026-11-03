import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { Incident } from '../incidents/incident.entity';

@Entity('archivos_incidentes')
@Index('idx_archivos_incidente', ['incidentId'])
export class IncidentMedia {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'id_incidente', type: 'bigint', unsigned: true })
  incidentId!: string;

  @Column({ name: 'tipo_archivo', type: 'varchar', length: 20 })
  mediaType!: 'IMAGE' | 'VIDEO';

  @Column({ name: 'url_archivo', type: 'varchar', length: 2048 })
  url!: string;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @ManyToOne(() => Incident, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'id_incidente',
    foreignKeyConstraintName: 'fk_archivos_incidente',
  })
  incident?: Relation<Incident>;
}
