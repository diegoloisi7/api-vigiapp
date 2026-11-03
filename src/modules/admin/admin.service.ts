import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { Category } from '../categories/category.entity';
import { ContactSubmission } from '../contact/contact-submission.entity';
import { Group } from '../groups/group.entity';
import { GroupInvitation } from '../invitations/group-invitation.entity';
import { Incident } from '../incidents/incident.entity';
import { IncidentViewsService } from '../incidents/incident-views.service';
import { IncidentResolutionMark } from '../incidents/incident-resolution-mark.entity';
import { IncidentStatusEvent } from '../incidents/incident-status-event.entity';
import { IncidentConfirmation } from '../confirmations/incident-confirmation.entity';
import { IncidentMedia } from '../media/incident-media.entity';
import { Membership } from '../memberships/membership.entity';
import { ImportantNotice } from '../notices/important-notice.entity';
import { NoticesService } from '../notices/notices.service';
import { Notification } from '../notifications/notification.entity';
import { User } from '../users/user.entity';

@Injectable()
export class AdminService {
  constructor(private readonly db: DataSource, private readonly incidents: IncidentViewsService,
    private readonly notices: NoticesService) {}

  private async groupView(group: Group) {
    const owner = await this.db.getRepository(User).findOneBy({ id: group.createdByUserId });
    const [members, incidents, notices] = await Promise.all([
      this.db.getRepository(Membership).countBy({ groupId: group.id }),
      this.db.getRepository(Incident).countBy({ groupId: group.id, deletedAt: IsNull() }),
      this.db.getRepository(ImportantNotice).countBy({ groupId: group.id, deletedAt: IsNull() }),
    ]);
    return { id: Number(group.id), nombre: group.name, zona: group.description ?? '',
      ownerId: Number(group.createdByUserId), ownerNombre: owner ? `${owner.firstName} ${owner.lastName}` : '',
      cantidadVecinos: members, cantidadIncidentes: incidents, cantidadAvisos: notices,
      creado: group.createdAt.toISOString() };
  }

  async groups() {
    const groups = await this.db.getRepository(Group).find({ order: { id: 'ASC' } });
    return Promise.all(groups.map((group) => this.groupView(group)));
  }

  async updateGroup(id: string, body: { nombre?: string; zona?: string }) {
    const repository = this.db.getRepository(Group);
    const group = await repository.findOneBy({ id });
    if (!group) throw new NotFoundException('Grupo no encontrado');
    if (body.nombre !== undefined) group.name = body.nombre.trim();
    if (body.zona !== undefined) group.description = body.zona.trim();
    if (!group.name) throw new BadRequestException('Nombre obligatorio');
    group.updatedAt = new Date();
    return this.groupView(await repository.save(group));
  }

  async deleteGroup(id: string) {
    if (!(await this.db.getRepository(Group).existsBy({ id }))) throw new NotFoundException('Grupo no encontrado');
    await this.db.transaction(async (manager) => {
      const incidentIds = (await manager.getRepository(Incident).find({ select: { id: true }, where: { groupId: id } })).map((item) => item.id);
      if (incidentIds.length) {
        await manager.createQueryBuilder().delete().from(IncidentMedia).where('id_incidente IN (:...ids)', { ids: incidentIds }).execute();
        await manager.createQueryBuilder().delete().from(IncidentConfirmation).where('id_incidente IN (:...ids)', { ids: incidentIds }).execute();
        await manager.createQueryBuilder().delete().from(IncidentResolutionMark).where('id_incidente IN (:...ids)', { ids: incidentIds }).execute();
        await manager.createQueryBuilder().delete().from(IncidentStatusEvent).where('id_incidente IN (:...ids)', { ids: incidentIds }).execute();
        await manager.createQueryBuilder().delete().from(Notification).where('id_incidente IN (:...ids)', { ids: incidentIds }).execute();
      }
      await manager.getRepository(Incident).delete({ groupId: id });
      await manager.getRepository(ImportantNotice).delete({ groupId: id });
      await manager.getRepository(GroupInvitation).delete({ groupId: id });
      await manager.getRepository(Membership).delete({ groupId: id });
      await manager.getRepository(Group).delete(id);
    });
  }

  private async userView(user: User) {
    return { id: Number(user.id), nombre: user.firstName, apellido: user.lastName, email: user.email,
      rol: user.appRole === 'ADMIN' ? 'ADMINISTRADOR' : 'VECINO', creado: user.createdAt.toISOString(),
      cantidadGrupos: await this.db.getRepository(Membership).countBy({ userId: user.id }) };
  }

  async users() {
    return Promise.all((await this.db.getRepository(User).find({ order: { id: 'ASC' } })).map((user) => this.userView(user)));
  }

  async updateUser(id: string, body: { nombre?: string; apellido?: string; email?: string; rol?: 'VECINO' | 'ADMINISTRADOR' }, actor: AuthenticatedUser) {
    const repository = this.db.getRepository(User);
    const user = await repository.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (id === actor.id && body.rol && body.rol !== 'ADMINISTRADOR') throw new ConflictException('No podés cambiar tu propio rol');
    if (body.nombre !== undefined) user.firstName = body.nombre.trim();
    if (body.apellido !== undefined) user.lastName = body.apellido.trim();
    if (body.email !== undefined) user.email = body.email.trim().toLowerCase();
    if (body.rol !== undefined) user.appRole = body.rol === 'ADMINISTRADOR' ? 'ADMIN' : 'USER';
    if (!user.firstName || !user.lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) throw new BadRequestException('Datos de usuario inválidos');
    user.updatedAt = new Date();
    return this.userView(await repository.save(user));
  }

  async deleteUser(id: string, actor: AuthenticatedUser) {
    if (id === actor.id) throw new ConflictException('No podés eliminar tu propia cuenta');
    const repository = this.db.getRepository(User);
    if (!(await repository.existsBy({ id }))) throw new NotFoundException('Usuario no encontrado');
    if (await this.db.getRepository(Group).existsBy({ createdByUserId: id })) throw new ConflictException('El usuario es creador de un grupo');
    await this.db.transaction(async (manager) => {
      const incidentIds = (await manager.getRepository(Incident).find({ select: { id: true }, where: { createdByUserId: id } })).map((item) => item.id);
      if (incidentIds.length) {
        await manager.createQueryBuilder().delete().from(IncidentMedia).where('id_incidente IN (:...ids)', { ids: incidentIds }).execute();
        await manager.createQueryBuilder().delete().from(IncidentConfirmation).where('id_incidente IN (:...ids)', { ids: incidentIds }).execute();
        await manager.createQueryBuilder().delete().from(IncidentResolutionMark).where('id_incidente IN (:...ids)', { ids: incidentIds }).execute();
        await manager.createQueryBuilder().delete().from(IncidentStatusEvent).where('id_incidente IN (:...ids)', { ids: incidentIds }).execute();
        await manager.createQueryBuilder().delete().from(Notification).where('id_incidente IN (:...ids)', { ids: incidentIds }).execute();
      }
      await manager.getRepository(Incident).delete({ createdByUserId: id });
      await manager.getRepository(ImportantNotice).delete({ createdByUserId: id });
      await manager.getRepository(GroupInvitation).delete({ invitedUserId: id });
      await manager.getRepository(GroupInvitation).delete({ invitedByUserId: id });
      await manager.getRepository(IncidentStatusEvent).update({ actorId: id }, { actorId: null });
      await manager.getRepository(Membership).delete({ userId: id });
      await manager.getRepository(Notification).delete({ userId: id });
      await manager.getRepository(IncidentConfirmation).delete({ userId: id });
      await manager.getRepository(IncidentResolutionMark).delete({ userId: id });
      await manager.getRepository(User).delete(id);
    });
  }

  deleteIncident(id: string, actor: AuthenticatedUser) { return this.incidents.remove(id, actor); }
  deleteNotice(id: string, actor: AuthenticatedUser) { return this.notices.remove(id, actor); }

  private categoryView(category: Category) {
    return { id: String(category.id), nombre: category.name, icono: category.icon ?? '📌', activa: category.active };
  }

  async createCategory(body: { nombre: string; icono: string }) {
    if (!body.nombre?.trim()) throw new BadRequestException('Nombre obligatorio');
    const repository = this.db.getRepository(Category);
    const category = await repository.save(repository.create({ name: body.nombre.trim(), icon: body.icono || null, description: null, active: true }));
    return this.categoryView(category);
  }

  async updateCategory(id: string, body: { nombre?: string; icono?: string; activa?: boolean }) {
    const repository = this.db.getRepository(Category);
    const category = await repository.findOneBy({ id });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    if (body.nombre !== undefined) category.name = body.nombre.trim();
    if (body.icono !== undefined) category.icon = body.icono;
    if (body.activa !== undefined) category.active = body.activa;
    if (!category.name) throw new BadRequestException('Nombre obligatorio');
    return this.categoryView(await repository.save(category));
  }

  async stats() {
    const [groups, users, memberships, incidents, notices, contacts, categories] = await Promise.all([
      this.db.getRepository(Group).find(), this.db.getRepository(User).find(),
      this.db.getRepository(Membership).find(), this.db.getRepository(Incident).findBy({ deletedAt: IsNull() }),
      this.db.getRepository(ImportantNotice).findBy({ deletedAt: IsNull() }), this.db.getRepository(ContactSubmission).find(),
      this.db.getRepository(Category).find(),
    ]);
    const now = Date.now();
    const state = (item: Incident) => item.status === 'RESOLVED' ? 'RESUELTO' : item.status === 'DISMISSED' ? 'DESCARTADO' :
      item.expiresAt.getTime() <= now ? 'EXPIRADO' : item.status === 'FOLLOWING' ? 'EN_SEGUIMIENTO' : 'REPORTADO';
    const incidentesPorEstado = { REPORTADO: 0, EN_SEGUIMIENTO: 0, RESUELTO: 0, DESCARTADO: 0, EXPIRADO: 0 };
    incidents.forEach((item) => { incidentesPorEstado[state(item)] += 1; });
    const ultimos7dias = Array.from({ length: 7 }, (_, index) => {
      const day = new Date(now - (6 - index) * 86_400_000).toISOString().slice(0, 10);
      return { etiqueta: day.slice(5), cantidad: incidents.filter((item) => item.createdAt.toISOString().slice(0, 10) === day).length };
    });
    const porCategoria = categories.map((category) => ({ categoriaId: category.id, nombre: category.name,
      icono: category.icon ?? '📌', cantidad: incidents.filter((item) => item.categoryId === category.id).length }));
    const topGrupos = groups.map((group) => ({ grupoId: Number(group.id), nombre: group.name,
      vecinos: memberships.filter((item) => item.groupId === group.id).length,
      incidentes: incidents.filter((item) => item.groupId === group.id).length })).sort((a, b) => b.incidentes - a.incidentes).slice(0, 5);
    return { totalGrupos: groups.length, totalUsuarios: users.length, totalVecinos: users.filter((user) => user.appRole === 'USER').length,
      usuariosNuevos30d: users.filter((user) => user.createdAt.getTime() > now - 30 * 86_400_000).length,
      urgentesActivos: incidents.filter((item) => item.reportType === 'URGENT' && ['REPORTADO', 'EN_SEGUIMIENTO'].includes(state(item))).length,
      avisosVigentes: notices.filter((item) => !item.closedAt && (!item.expiresAt || item.expiresAt.getTime() > now)).length,
      contactosSinLeer: contacts.filter((item) => !item.readAt).length,
      incidentesPorEstado, ultimos7dias, porCategoria, topGrupos };
  }
}
