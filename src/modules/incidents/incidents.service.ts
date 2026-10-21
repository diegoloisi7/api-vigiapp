import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { GroupAccessService } from '../../common/group-access.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { ListIncidentsDto } from './dto/list-incidents.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { Incident } from './incident.entity';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private readonly incidents: Repository<Incident>,
    private readonly groupAccess: GroupAccessService,
  ) {}

  private response(
    incident: Incident,
    actor: AuthenticatedUser,
    administeredGroupIds: ReadonlySet<string>,
  ) {
    const { createdByUserId, deletedAt, ...data } = incident;
    void deletedAt;
    const maySeeAuthor =
      !incident.isAnonymous ||
      actor.appRole === 'ADMIN' ||
      createdByUserId === actor.id ||
      administeredGroupIds.has(incident.groupId);
    return maySeeAuthor ? { ...data, createdByUserId } : data;
  }

  private async responseForActor(incident: Incident, actor: AuthenticatedUser) {
    const administeredGroupIds =
      incident.isAnonymous &&
      actor.appRole !== 'ADMIN' &&
      incident.createdByUserId !== actor.id
        ? new Set(await this.groupAccess.groupIdsAdministeredBy(actor.id))
        : new Set<string>();
    return this.response(incident, actor, administeredGroupIds);
  }

  private validate(incident: Incident, requireFuture: boolean) {
    if (incident.reportType === 'STANDARD' && !incident.categoryId)
      throw new BadRequestException('Un reporte estándar requiere categoría');
    if (incident.reportType === 'URGENT' && incident.isAnonymous)
      throw new BadRequestException('Un reporte urgente no puede ser anónimo');
    if (
      incident.expiresAt.getTime() <= (incident.createdAt?.getTime() ?? 0) ||
      (requireFuture && incident.expiresAt.getTime() <= Date.now())
    ) {
      throw new BadRequestException('El vencimiento debe ser una fecha futura');
    }
  }

  private async assertCanManage(incident: Incident, actor: AuthenticatedUser) {
    if (
      actor.appRole === 'ADMIN' ||
      incident.createdByUserId === actor.id ||
      (await this.groupAccess.isGroupAdmin(actor.id, incident.groupId))
    )
      return;
    throw new ForbiddenException(
      'Solo el autor, un administrador del grupo o un administrador global puede modificar el incidente',
    );
  }

  async create(dto: CreateIncidentDto, actor: AuthenticatedUser) {
    if (!(await this.groupAccess.isMember(actor.id, dto.groupId))) {
      throw new ForbiddenException(
        'Debés pertenecer al grupo para reportar un incidente',
      );
    }
    if (
      !(await this.groupAccess.isCoordinateInsideGroup(
        dto.groupId,
        dto.latitude,
        dto.longitude,
      ))
    ) {
      throw new BadRequestException(
        'La ubicación del incidente está fuera del área del grupo',
      );
    }
    const { expiresAt, ...data } = dto;
    const now = new Date();
    const incident = this.incidents.create({
      ...data,
      createdByUserId: actor.id,
      expiresAt: new Date(expiresAt),
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
    this.validate(incident, true);
    const saved = await this.incidents.save(incident);
    return this.getOne(String(saved.id), actor);
  }

  async findAll(query: ListIncidentsDto, actor: AuthenticatedUser) {
    const qb = this.incidents
      .createQueryBuilder('incident')
      .where('incident.deleted_at IS NULL');
    let administeredGroupIds: ReadonlySet<string> = new Set();
    if (actor.appRole !== 'ADMIN') {
      const groupIds = await this.groupAccess.groupIdsForUser(actor.id);
      if (query.groupId && !groupIds.includes(query.groupId))
        throw new ForbiddenException('No pertenecés a ese grupo');
      if (groupIds.length === 0) return [];
      qb.andWhere('incident.group_id IN (:...groupIds)', { groupIds });
      administeredGroupIds = new Set(
        await this.groupAccess.groupIdsAdministeredBy(actor.id),
      );
    }
    if (query.groupId)
      qb.andWhere('incident.group_id = :groupId', { groupId: query.groupId });
    if (query.active === 'true')
      qb.andWhere('incident.status = :status', { status: 'ACTIVE' }).andWhere(
        'incident.expires_at > UTC_TIMESTAMP(3)',
      );
    return (await qb.orderBy('incident.created_at', 'DESC').getMany()).map(
      (item) => this.response(item, actor, administeredGroupIds),
    );
  }

  async findOne(id: string, actor: AuthenticatedUser) {
    const incident = await this.incidents.findOneBy({
      id,
      deletedAt: IsNull(),
    });
    if (!incident) throw new NotFoundException('Incidente no encontrado');
    if (
      actor.appRole !== 'ADMIN' &&
      !(await this.groupAccess.isMember(actor.id, incident.groupId))
    ) {
      throw new ForbiddenException('No pertenecés al grupo de este incidente');
    }
    return incident;
  }

  async getOne(id: string, actor: AuthenticatedUser) {
    return this.responseForActor(await this.findOne(id, actor), actor);
  }

  async update(id: string, dto: UpdateIncidentDto, actor: AuthenticatedUser) {
    const incident = await this.findOne(id, actor);
    await this.assertCanManage(incident, actor);
    const latitude = dto.latitude ?? incident.latitude;
    const longitude = dto.longitude ?? incident.longitude;
    if (
      (dto.latitude !== undefined || dto.longitude !== undefined) &&
      !(await this.groupAccess.isCoordinateInsideGroup(
        incident.groupId,
        latitude,
        longitude,
      ))
    ) {
      throw new BadRequestException(
        'La ubicación del incidente está fuera del área del grupo',
      );
    }
    const { expiresAt, ...data } = dto;
    Object.assign(incident, data);
    if (expiresAt !== undefined) incident.expiresAt = new Date(expiresAt);
    this.validate(incident, expiresAt !== undefined);
    incident.updatedAt = new Date();
    return this.responseForActor(await this.incidents.save(incident), actor);
  }

  async remove(id: string, actor: AuthenticatedUser) {
    const incident = await this.findOne(id, actor);
    await this.assertCanManage(incident, actor);
    const now = new Date();
    await this.incidents.update({ id }, { deletedAt: now, updatedAt: now });
  }
}
