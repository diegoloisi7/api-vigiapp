import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('marcas_resolucion_incidentes')
export class IncidentResolutionMark {
  @PrimaryColumn({ name: 'id_incidente', type: 'bigint', unsigned: true }) incidentId!: string;
  @PrimaryColumn({ name: 'id_usuario', type: 'bigint', unsigned: true }) userId!: string;
  @CreateDateColumn({ name: 'fecha_creacion', type: 'datetime', precision: 3 }) createdAt!: Date;
}
