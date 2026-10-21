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

@Entity('incident_media')
@Index('idx_media_incident', ['incidentId'])
export class IncidentMedia {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: string;

  @Column({ name: 'incident_id', type: 'bigint', unsigned: true })
  incidentId!: string;

  @Column({ name: 'media_type', type: 'varchar', length: 20 })
  mediaType!: 'IMAGE' | 'VIDEO';

  @Column({ type: 'varchar', length: 2048 })
  url!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt!: Date;

  @ManyToOne(() => Incident, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  @JoinColumn({
    name: 'incident_id',
    foreignKeyConstraintName: 'fk_media_incident',
  })
  incident?: Relation<Incident>;
}
