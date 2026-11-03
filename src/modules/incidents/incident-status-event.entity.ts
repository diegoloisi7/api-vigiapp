import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('eventos_estado_incidentes')
export class IncidentStatusEvent {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true }) id!: string;
  @Column({ name: 'id_incidente', type: 'bigint', unsigned: true }) incidentId!: string;
  @Column({ name: 'id_usuario_actor', type: 'bigint', unsigned: true, nullable: true }) actorId!: string | null;
  @Column({ name: 'estado', type: 'varchar', length: 30 }) status!: string;
  @Column({ name: 'nota', type: 'varchar', length: 200, nullable: true }) note!: string | null;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime', precision: 3 }) createdAt!: Date;
}
