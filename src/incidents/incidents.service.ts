import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Incident } from './incident.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { ListIncidentsDto } from './dto/list-incidents.dto';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidents: Repository<Incident>,
  ) {}

  private response(incident: Incident) {
    const { createdByUserId, deletedAt, ...data } = incident;
    void deletedAt;
    return incident.isAnonymous ? data : { ...data, createdByUserId };
  }

  private validate(incident: Incident, requireFuture: boolean) {
    if (incident.reportType === 'STANDARD' && !incident.categoryId) {
      throw new BadRequestException('Un reporte estándar requiere categoría');
    }
    if (incident.reportType === 'URGENT' && incident.isAnonymous) {
      throw new BadRequestException('Un reporte urgente no puede ser anónimo');
    }
    if (
      incident.expiresAt.getTime() <= (incident.createdAt?.getTime() ?? 0) ||
      (requireFuture && incident.expiresAt.getTime() <= Date.now())
    ) {
      throw new BadRequestException('El vencimiento debe ser una fecha futura');
    }
  }

  async create(dto: CreateIncidentDto) {
    const { expiresAt, ...data } = dto;
    const now = new Date();
    const incident = this.incidents.create({
      ...data,
      expiresAt: new Date(expiresAt),
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
    this.validate(incident, true);
    const saved = await this.incidents.save(incident);
    return this.getOne(String(saved.id));
  }

  async findAll(query: ListIncidentsDto) {
    const qb = this.incidents
      .createQueryBuilder('incident')
      .where('incident.deleted_at IS NULL');
    if (query.groupId)
      qb.andWhere('incident.group_id = :groupId', { groupId: query.groupId });
    if (query.active === 'true') {
      qb.andWhere('incident.status = :status', { status: 'ACTIVE' }).andWhere(
        'incident.expires_at > UTC_TIMESTAMP(3)',
      );
    }
    return (await qb.orderBy('incident.created_at', 'DESC').getMany()).map(
      (incident) => this.response(incident),
    );
  }

  async findOne(id: string) {
    const incident = await this.incidents.findOneBy({
      id,
      deletedAt: IsNull(),
    });
    if (!incident) throw new NotFoundException('Incidente no encontrado');
    return incident;
  }

  async getOne(id: string) {
    return this.response(await this.findOne(id));
  }

  async update(id: string, dto: UpdateIncidentDto) {
    const incident = await this.findOne(id);
    const { expiresAt, ...data } = dto;
    Object.assign(incident, data);
    if (expiresAt !== undefined) incident.expiresAt = new Date(expiresAt);
    this.validate(incident, expiresAt !== undefined);
    incident.updatedAt = new Date();
    return this.response(await this.incidents.save(incident));
  }

  async remove(id: string) {
    await this.findOne(id);
    const now = new Date();
    await this.incidents.update({ id }, { deletedAt: now, updatedAt: now });
  }
}
