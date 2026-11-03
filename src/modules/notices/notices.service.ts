import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupAccessService } from '../../common/group-access.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { User } from '../users/user.entity';
import { ImportantNotice } from './important-notice.entity';

interface NoticeInput {
  titulo?: string; cuerpo?: string; prioridad?: 'NORMAL' | 'IMPORTANTE';
  vigenciaDias?: number | null; grupoId?: number;
}

@Injectable()
export class NoticesService {
  constructor(
    @InjectRepository(ImportantNotice) private readonly notices: Repository<ImportantNotice>,
    private readonly access: GroupAccessService,
  ) {}

  private status(notice: ImportantNotice) {
    return notice.closedAt ? 'CERRADO' : notice.expiresAt && notice.expiresAt.getTime() <= Date.now() ? 'EXPIRADO' : 'VIGENTE';
  }

  private async view(notice: ImportantNotice) {
    const author = await this.notices.manager.getRepository(User).findOneBy({ id: notice.createdByUserId });
    return {
      id: Number(notice.id), grupoId: Number(notice.groupId),
      prioridad: notice.priority, titulo: notice.title, cuerpo: notice.description,
      fecha: notice.publishedAt.toISOString(), vence: notice.expiresAt?.toISOString() ?? null,
      estado: this.status(notice), autorId: Number(notice.createdByUserId),
      autorNombre: author ? `${author.firstName} ${author.lastName}` : '',
    };
  }

  async list(groupId: string | undefined, mine: boolean, actor: AuthenticatedUser) {
    const query = this.notices.createQueryBuilder('notice').where('notice.fecha_eliminacion IS NULL');
    if (mine) query.andWhere('notice.id_usuario_creador = :userId', { userId: actor.id });
    if (actor.appRole !== 'ADMIN') {
      const groupIds = await this.access.groupIdsForUser(actor.id);
      if (groupId && !groupIds.includes(groupId)) throw new ForbiddenException('No pertenecés a este grupo');
      if (!groupIds.length) return [];
      query.andWhere('notice.id_grupo IN (:...groupIds)', { groupIds });
    }
    if (groupId) query.andWhere('notice.id_grupo = :groupId', { groupId });
    const notices = await query.orderBy('notice.fecha_publicacion', 'DESC').getMany();
    return Promise.all(notices.map((notice) => this.view(notice)));
  }

  private async findOne(id: string) {
    const notice = await this.notices.findOneBy({ id });
    if (!notice || notice.deletedAt) throw new NotFoundException('Aviso no encontrado');
    return notice;
  }

  private async canManage(notice: ImportantNotice, actor: AuthenticatedUser) {
    if (actor.appRole === 'ADMIN' || notice.createdByUserId === actor.id || await this.access.isGroupAdmin(actor.id, notice.groupId)) return;
    throw new ForbiddenException('No podés modificar este aviso');
  }

  async create(input: NoticeInput, actor: AuthenticatedUser) {
    if (!input.grupoId || !input.titulo?.trim() || !input.cuerpo?.trim() ||
      !['NORMAL', 'IMPORTANTE'].includes(input.prioridad ?? '') ||
      (input.vigenciaDias !== null && (!Number.isInteger(input.vigenciaDias) || (input.vigenciaDias ?? 0) < 1 || (input.vigenciaDias ?? 0) > 365))) {
      throw new BadRequestException('Datos de aviso inválidos');
    }
    const groupId = String(input.grupoId);
    if (!(await this.access.isMember(actor.id, groupId))) throw new ForbiddenException('No pertenecés al grupo');
    const now = new Date();
    const notice = await this.notices.save(this.notices.create({
      groupId, createdByUserId: actor.id, title: input.titulo.trim(), description: input.cuerpo.trim(),
      priority: input.prioridad!, publishedAt: now,
      expiresAt: input.vigenciaDias === null ? null : new Date(now.getTime() + input.vigenciaDias! * 86_400_000),
      updatedAt: now, closedAt: null, deletedAt: null,
    }));
    return this.view(notice);
  }

  async update(id: string, input: Pick<NoticeInput, 'titulo' | 'cuerpo' | 'prioridad'>, actor: AuthenticatedUser) {
    const notice = await this.findOne(id);
    await this.canManage(notice, actor);
    if (this.status(notice) !== 'VIGENTE') throw new ConflictException('El aviso está cerrado');
    if (input.titulo !== undefined) notice.title = input.titulo.trim();
    if (input.cuerpo !== undefined) notice.description = input.cuerpo.trim();
    if (input.prioridad !== undefined) {
      if (!['NORMAL', 'IMPORTANTE'].includes(input.prioridad)) throw new BadRequestException('Prioridad inválida');
      notice.priority = input.prioridad;
    }
    if (!notice.title || !notice.description) throw new BadRequestException('Título y mensaje son obligatorios');
    notice.updatedAt = new Date();
    return this.view(await this.notices.save(notice));
  }

  async close(id: string, actor: AuthenticatedUser) {
    const notice = await this.findOne(id);
    await this.canManage(notice, actor);
    if (this.status(notice) !== 'VIGENTE') throw new ConflictException('El aviso ya está cerrado');
    notice.closedAt = new Date();
    notice.updatedAt = new Date();
    return this.view(await this.notices.save(notice));
  }

  async remove(id: string, actor: AuthenticatedUser) {
    if (actor.appRole !== 'ADMIN') throw new ForbiddenException('Solo el administrador puede eliminar avisos');
    await this.findOne(id);
    await this.notices.update(id, { deletedAt: new Date() });
  }
}
