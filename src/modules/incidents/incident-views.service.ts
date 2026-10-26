import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupAccessService } from '../../common/group-access.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { IncidentConfirmation } from '../confirmations/incident-confirmation.entity';
import { IncidentMedia } from '../media/incident-media.entity';
import { IncidentsService } from './incidents.service';
import { Incident } from './incident.entity';
import { IncidentResolutionMark } from './incident-resolution-mark.entity';
import { IncidentStatusEvent } from './incident-status-event.entity';
import { NotificationsService } from '../notifications/notifications.service';

interface NormalInput {
  titulo?: string; categoriaId?: string; descripcion?: string; ubicacion?: string;
  lat?: number | null; lng?: number | null; grupoId?: number; vigenciaDias?: number;
}
interface UrgentInput { lat?: number | null; lng?: number | null; grupoId?: number }
interface UpdateInput { titulo?: string; categoriaId?: string; descripcion?: string; ubicacion?: string }

@Injectable()
export class IncidentViewsService {
  constructor(
    @InjectRepository(Incident) private readonly repository: Repository<Incident>,
    @InjectRepository(IncidentConfirmation) private readonly confirmations: Repository<IncidentConfirmation>,
    @InjectRepository(IncidentResolutionMark) private readonly resolutionMarks: Repository<IncidentResolutionMark>,
    @InjectRepository(IncidentStatusEvent) private readonly events: Repository<IncidentStatusEvent>,
    @InjectRepository(IncidentMedia) private readonly media: Repository<IncidentMedia>,
    private readonly incidents: IncidentsService,
    private readonly access: GroupAccessService,
    private readonly notifications: NotificationsService,
  ) {}

  private safeId(value: string | null | undefined) {
    if (!value) return 0;
    const number = Number(value);
    if (!Number.isSafeInteger(number)) throw new ConflictException('ID demasiado grande para el cliente actual');
    return number;
  }

  private clientStatus(incident: Incident) {
    if (incident.status === 'RESOLVED') return 'RESUELTO';
    if (incident.status === 'DISMISSED') return 'DESCARTADO';
    if (incident.expiresAt.getTime() <= Date.now()) return 'EXPIRADO';
    return incident.status === 'FOLLOWING' ? 'EN_SEGUIMIENTO' : 'REPORTADO';
  }

  private async view(incident: Incident, actor: AuthenticatedUser) {
    const [seen, resolved, events, photo, mineSeen, mineResolved] = await Promise.all([
      this.confirmations.countBy({ incidentId: incident.id }),
      this.resolutionMarks.countBy({ incidentId: incident.id }),
      this.events.find({ where: { incidentId: incident.id }, order: { createdAt: 'ASC' } }),
      this.media.findOneBy({ incidentId: incident.id, mediaType: 'IMAGE' }),
      this.confirmations.existsBy({ incidentId: incident.id, userId: actor.id }),
      this.resolutionMarks.existsBy({ incidentId: incident.id, userId: actor.id }),
    ]);
    const authorVisible = !incident.isAnonymous || actor.appRole === 'ADMIN' || actor.id === incident.createdByUserId ||
      await this.access.isGroupAdmin(actor.id, incident.groupId);
    const history = events.length ? events.map((event) => ({
      estado: event.status === 'FOLLOWING' ? 'EN_SEGUIMIENTO' : event.status === 'RESOLVED' ? 'RESUELTO' : event.status === 'DISMISSED' ? 'DESCARTADO' : 'REPORTADO',
      cuando: event.createdAt.toISOString(), nota: event.note ?? '',
    })) : [{ estado: 'REPORTADO', cuando: incident.createdAt.toISOString(), nota: 'Incidente reportado' }];
    return {
      id: this.safeId(incident.id),
      grupoId: this.safeId(incident.groupId),
      titulo: incident.title || (incident.reportType === 'URGENT' ? 'Pedido de ayuda urgente' : ''),
      categoriaId: incident.categoryId ?? '',
      estado: this.clientStatus(incident),
      creada: incident.createdAt.toISOString(),
      ubicacion: incident.locationLabel || `${Number(incident.latitude).toFixed(5)}, ${Number(incident.longitude).toFixed(5)}`,
      lat: Number(incident.latitude), lng: Number(incident.longitude),
      descripcion: incident.description ?? '',
      fotoUrl: photo ? `${process.env.PUBLIC_API_URL ?? 'http://localhost:3000/api'}/incidencias/${incident.id}/foto` : null,
      vecinos: seen,
      distancia: 0,
      historial: history,
      tipo: incident.reportType === 'URGENT' ? 'URGENTE' : 'NORMAL',
      autorId: authorVisible ? this.safeId(incident.createdByUserId) : 0,
      fechaExpiracion: incident.expiresAt.toISOString(),
      vecinosYaResuelto: resolved,
      yoConfirme: mineSeen,
      yoMarqueResuelto: mineResolved,
    };
  }

  async list(groupId: string | undefined, mine: boolean, actor: AuthenticatedUser) {
    const query = this.repository.createQueryBuilder('incident').where('incident.fecha_eliminacion IS NULL');
    if (mine) query.andWhere('incident.id_usuario_creador = :actorId', { actorId: actor.id });
    if (actor.appRole !== 'ADMIN') {
      const groupIds = await this.access.groupIdsForUser(actor.id);
      if (groupId && !groupIds.includes(groupId)) throw new ForbiddenException('No pertenecés a este grupo');
      if (!groupIds.length) return [];
      query.andWhere('incident.id_grupo IN (:...groupIds)', { groupIds });
    }
    if (groupId) query.andWhere('incident.id_grupo = :groupId', { groupId });
    const incidents = await query.orderBy('incident.fecha_creacion', 'DESC').getMany();
    return Promise.all(incidents.map((incident) => this.view(incident, actor)));
  }

  async get(id: string, actor: AuthenticatedUser) {
    const incident = await this.incidents.findOne(id, actor);
    return this.view(incident, actor);
  }

  async createNormal(input: NormalInput, actor: AuthenticatedUser) {
    if (!input.grupoId || !input.categoriaId || !input.titulo?.trim() || !input.descripcion?.trim() ||
      !Number.isFinite(input.lat) || !Number.isFinite(input.lng) || !Number.isInteger(input.vigenciaDias) ||
      (input.vigenciaDias ?? 0) < 1 || (input.vigenciaDias ?? 0) > 365) {
      throw new BadRequestException('Faltan datos válidos del incidente, ubicación o vigencia');
    }
    const result = await this.incidents.create({
      groupId: String(input.grupoId), categoryId: input.categoriaId,
      reportType: 'STANDARD', title: input.titulo.trim(), description: input.descripcion.trim(),
      locationLabel: input.ubicacion?.trim() || null,
      latitude: input.lat!, longitude: input.lng!, locationSource: 'MANUAL', isAnonymous: false,
      expiresAt: new Date(Date.now() + input.vigenciaDias! * 86_400_000).toISOString(),
    }, actor);
    const incident = await this.repository.findOneByOrFail({ id: String(result.id) });
    return this.view(incident, actor);
  }

  async createUrgent(input: UrgentInput, actor: AuthenticatedUser) {
    if (!input.grupoId || !Number.isFinite(input.lat) || !Number.isFinite(input.lng)) {
      throw new BadRequestException('El pedido de ayuda requiere una ubicación válida');
    }
    const groupId = String(input.grupoId);
    if (!(await this.access.isMember(actor.id, groupId))) throw new ForbiddenException('No pertenecés al grupo');
    if (!(await this.access.isCoordinateInsideGroup(groupId, input.lat!, input.lng!))) {
      throw new BadRequestException('La ubicación está fuera del área del grupo');
    }
    const created = await this.repository.manager.transaction(async (manager) => {
      const now = new Date();
      const saved = await manager.getRepository(Incident).save({
        groupId, createdByUserId: actor.id, categoryId: null, reportType: 'URGENT',
        title: null, description: null, locationLabel: null, latitude: input.lat!, longitude: input.lng!,
        locationSource: 'GPS', isAnonymous: false, status: 'ACTIVE',
        createdAt: now, updatedAt: now, expiresAt: new Date(now.getTime() + 86_400_000), deletedAt: null,
      });
      const id = String(saved.id);
      await manager.getRepository(IncidentStatusEvent).save({ incidentId: id, actorId: actor.id, status: 'ACTIVE', note: 'Pedido de ayuda enviado', createdAt: now });
      const recipientIds = await this.notifications.persistForUrgent(manager, id, groupId, actor.id);
      return { id, recipientIds };
    });
    this.notifications.emitUrgent(groupId, created.id, created.recipientIds);
    const incident = await this.repository.findOneByOrFail({ id: created.id });
    return this.view(incident, actor);
  }

  async update(id: string, input: UpdateInput, actor: AuthenticatedUser) {
    const incident = await this.incidents.findOne(id, actor);
    if (this.clientStatus(incident) === 'EXPIRADO' || ['RESOLVED', 'DISMISSED'].includes(incident.status)) {
      throw new ConflictException('El incidente está cerrado');
    }
    const updated = await this.incidents.update(id, {
      ...(input.titulo !== undefined ? { title: input.titulo } : {}),
      ...(input.descripcion !== undefined ? { description: input.descripcion } : {}),
      ...(input.categoriaId !== undefined ? { categoryId: input.categoriaId } : {}),
      ...(input.ubicacion !== undefined ? { locationLabel: input.ubicacion } : {}),
    }, actor);
    void updated;
    return this.get(id, actor);
  }

  async changeStatus(id: string, status: string, note: string | undefined, actor: AuthenticatedUser) {
    const incident = await this.incidents.findOne(id, actor);
    if (actor.appRole !== 'ADMIN' && actor.id !== incident.createdByUserId && !(await this.access.isGroupAdmin(actor.id, incident.groupId))) {
      throw new ForbiddenException('No podés cambiar el estado');
    }
    const current = this.clientStatus(incident);
    const transitions: Record<string, string[]> = { REPORTADO: ['EN_SEGUIMIENTO', 'RESUELTO', 'DESCARTADO'], EN_SEGUIMIENTO: ['RESUELTO', 'DESCARTADO'] };
    if (!transitions[current]?.includes(status)) throw new ConflictException('Transición de estado no válida');
    const internal = status === 'EN_SEGUIMIENTO' ? 'FOLLOWING' : status === 'RESUELTO' ? 'RESOLVED' : 'DISMISSED';
    await this.repository.manager.transaction(async (manager) => {
      await manager.getRepository(Incident).update(id, { status: internal, updatedAt: new Date() });
      await manager.getRepository(IncidentStatusEvent).save({ incidentId: id, actorId: actor.id, status: internal, note: note?.trim() || null, createdAt: new Date() });
    });
    return this.get(id, actor);
  }

  async confirm(id: string, resolved: boolean, actor: AuthenticatedUser) {
    const incident = await this.incidents.findOne(id, actor);
    if (incident.createdByUserId === actor.id) throw new ForbiddenException('No podés confirmar tu propio incidente');
    if (['RESOLVED', 'DISMISSED', 'EXPIRADO'].includes(this.clientStatus(incident))) throw new ConflictException('El incidente está cerrado');
    if (resolved) {
      if (await this.resolutionMarks.existsBy({ incidentId: id, userId: actor.id })) throw new ConflictException('Ya confirmaste este incidente');
      await this.resolutionMarks.save(this.resolutionMarks.create({ incidentId: id, userId: actor.id, createdAt: new Date() }));
    } else {
      if (await this.confirmations.existsBy({ incidentId: id, userId: actor.id })) throw new ConflictException('Ya confirmaste este incidente');
      await this.confirmations.save(this.confirmations.create({ incidentId: id, userId: actor.id, confirmedAt: new Date() }));
    }
    return this.get(id, actor);
  }

  async unconfirm(id: string, actor: AuthenticatedUser) {
    await this.incidents.findOne(id, actor);
    await this.confirmations.delete({ incidentId: id, userId: actor.id });
    return this.get(id, actor);
  }

  async addPhoto(id: string, url: string, actor: AuthenticatedUser) {
    await this.incidents.findOne(id, actor);
    await this.media.save(this.media.create({ incidentId: id, mediaType: 'IMAGE', url, createdAt: new Date() }));
    return this.get(id, actor);
  }

  async storePhoto(id: string, file: { buffer: Buffer; mimetype: string; size: number }, actor: AuthenticatedUser) {
    const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
    const extension = extensions[file.mimetype];
    if (!extension || file.size > 5 * 1024 * 1024) throw new BadRequestException('La foto debe ser JPG, PNG, WebP o GIF y pesar hasta 5 MB');
    await this.incidents.findOne(id, actor);
    const directory = join(process.cwd(), 'uploads');
    await mkdir(directory, { recursive: true });
    const name = `${randomUUID()}.${extension}`;
    await writeFile(join(directory, name), file.buffer);
    return this.addPhoto(id, name, actor);
  }

  async photo(id: string, actor: AuthenticatedUser) {
    await this.incidents.findOne(id, actor);
    const photo = await this.media.findOneBy({ incidentId: id, mediaType: 'IMAGE' });
    if (!photo || !/^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(photo.url)) throw new NotFoundException('Foto no encontrada');
    const extension = photo.url.split('.').pop();
    const type = extension === 'jpg' ? 'image/jpeg' : `image/${extension}`;
    return { buffer: await readFile(join(process.cwd(), 'uploads', photo.url)), type };
  }

  async remove(id: string, actor: AuthenticatedUser) {
    await this.incidents.remove(id, actor);
  }
}
