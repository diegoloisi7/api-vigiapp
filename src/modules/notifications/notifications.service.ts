import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { Membership } from '../memberships/membership.entity';
import { Notification } from './notification.entity';
import { NotificationsGateway } from './notifications.gateway';
import { Incident } from '../incidents/incident.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(
    @InjectRepository(Notification) private readonly notifications: Repository<Notification>,
    private readonly gateway: NotificationsGateway,
  ) {}

  async persistForUrgent(manager: EntityManager, incidentId: string, groupId: string, authorId: string) {
    const memberships = await manager.getRepository(Membership).findBy({ groupId });
    const now = new Date();
    const recipients = memberships.filter((membership) => membership.userId !== authorId);
    if (recipients.length) await manager.getRepository(Notification).save(recipients.map((membership) => ({
      userId: membership.userId, incidentId, type: 'URGENT_INCIDENT' as const,
      title: 'Pedido de ayuda urgente', message: 'Se reportó una emergencia en tu grupo',
      readAt: null, createdAt: now,
    })));
    return recipients.map((membership) => membership.userId);
  }

  emitUrgent(groupId: string, incidentId: string, recipientIds: string[]) {
    void this.gateway.urgent(groupId, incidentId, recipientIds)
      .catch((cause: unknown) => this.logger.error('No se pudo emitir la alerta', cause instanceof Error ? cause.stack : undefined));
  }

  async mine(actor: AuthenticatedUser) {
    const notifications = await this.notifications.find({ where: { userId: actor.id }, order: { createdAt: 'DESC' } });
    return Promise.all(notifications.map(async (notification) => {
      const incident = notification.incidentId
        ? await this.notifications.manager.getRepository(Incident).findOneBy({ id: notification.incidentId }) : null;
      return {
        id: Number(notification.id), incidenteId: notification.incidentId ? Number(notification.incidentId) : null,
        grupoId: incident ? Number(incident.groupId) : null,
        tipo: notification.type, titulo: notification.title, mensaje: notification.message,
        creada: notification.createdAt.toISOString(), leida: notification.readAt !== null,
      };
    }));
  }

  async read(id: string, actor: AuthenticatedUser) {
    const notification = await this.notifications.findOneBy({ id });
    if (!notification) throw new NotFoundException('Notificación no encontrada');
    if (notification.userId !== actor.id) throw new ForbiddenException('No podés leer esta notificación');
    if (!notification.readAt) {
      notification.readAt = new Date();
      await this.notifications.save(notification);
    }
    return { id: Number(notification.id), leida: true };
  }
}
