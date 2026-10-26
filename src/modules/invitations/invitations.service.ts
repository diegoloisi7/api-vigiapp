import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { Group } from '../groups/group.entity';
import { Membership } from '../memberships/membership.entity';
import { User } from '../users/user.entity';
import { GroupInvitation } from './group-invitation.entity';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectRepository(GroupInvitation) private readonly invitations: Repository<GroupInvitation>,
    @InjectRepository(Group) private readonly groups: Repository<Group>,
    @InjectRepository(Membership) private readonly memberships: Repository<Membership>,
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly database: DataSource,
  ) {}

  private async requireGroupAdmin(groupId: string, actor: AuthenticatedUser) {
    const group = await this.groups.findOneBy({ id: groupId });
    if (!group) throw new NotFoundException('Grupo no encontrado');
    if (!(await this.memberships.existsBy({ groupId, userId: actor.id, groupRole: 'GROUP_ADMIN' }))) {
      throw new ForbiddenException('No administrás este grupo');
    }
    return group;
  }

  private async view(invitation: GroupInvitation) {
    const [group, invitee, sender] = await Promise.all([
      this.groups.findOneBy({ id: invitation.groupId }),
      this.users.findOneBy({ id: invitation.invitedUserId }),
      this.users.findOneBy({ id: invitation.invitedByUserId }),
    ]);
    return {
      id: Number(invitation.id), grupoId: Number(invitation.groupId), grupoNombre: group?.name ?? '',
      email: invitee?.email ?? '',
      estado: invitation.status === 'ACCEPTED' ? 'ACEPTADA' : invitation.status === 'DECLINED' ? 'RECHAZADA' : 'PENDIENTE',
      creada: invitation.invitedAt.toISOString(),
      invitadoPor: sender ? `${sender.firstName} ${sender.lastName}` : '',
    };
  }

  async invite(groupId: string, email: string, actor: AuthenticatedUser) {
    await this.requireGroupAdmin(groupId, actor);
    const invitee = await this.users.findOneBy({ email: email.trim().toLowerCase() });
    if (!invitee) throw new NotFoundException('El correo no pertenece a un usuario registrado');
    if (invitee.id === actor.id) throw new ConflictException('No podés invitarte a vos mismo');
    if (await this.memberships.existsBy({ groupId, userId: invitee.id })) throw new ConflictException('Ya pertenece al grupo');
    if (await this.invitations.existsBy({ groupId, invitedUserId: invitee.id, status: 'PENDING' })) {
      throw new ConflictException('Ya tiene una invitación pendiente');
    }
    const invitation = await this.invitations.save(this.invitations.create({
      groupId, invitedUserId: invitee.id, invitedByUserId: actor.id,
      status: 'PENDING', invitedAt: new Date(), closedAt: null,
    }));
    return this.view(invitation);
  }

  async cancel(groupId: string, id: string, actor: AuthenticatedUser) {
    await this.requireGroupAdmin(groupId, actor);
    const invitation = await this.invitations.findOneBy({ id, groupId });
    if (!invitation) throw new NotFoundException('Invitación no encontrada');
    if (invitation.status !== 'PENDING') throw new ConflictException('La invitación ya fue respondida');
    invitation.status = 'REVOKED';
    invitation.closedAt = new Date();
    await this.invitations.save(invitation);
  }

  async mine(actor: AuthenticatedUser) {
    const invitations = await this.invitations.findBy({ invitedUserId: actor.id, status: 'PENDING' });
    return Promise.all(invitations.map((invitation) => this.view(invitation)));
  }

  async respond(id: string, accept: boolean, actor: AuthenticatedUser) {
    const groupId = await this.database.transaction(async (manager) => {
      const invitations = manager.getRepository(GroupInvitation);
      const invitation = await invitations.findOne({ where: { id }, lock: { mode: 'pessimistic_write' } });
      if (!invitation) throw new NotFoundException('Invitación no encontrada');
      if (invitation.invitedUserId !== actor.id) throw new ForbiddenException('La invitación no es tuya');
      if (invitation.status !== 'PENDING') throw new ConflictException('La invitación ya fue respondida');
      if (accept) {
        const memberships = manager.getRepository(Membership);
        if (await memberships.existsBy({ userId: actor.id, groupId: invitation.groupId })) {
          throw new ConflictException('Ya pertenecés al grupo');
        }
        await memberships.save(memberships.create({ userId: actor.id, groupId: invitation.groupId, groupRole: 'NEIGHBOR', joinedAt: new Date() }));
      }
      invitation.status = accept ? 'ACCEPTED' : 'DECLINED';
      invitation.closedAt = new Date();
      await invitations.save(invitation);
      return invitation.groupId;
    });
    if (!accept) return null;
    const group = await this.groups.findOneBy({ id: groupId });
    return group ? { id: Number(group.id), nombre: group.name, zona: group.description ?? '',
      ownerId: Number(group.createdByUserId), miRol: 'MIEMBRO', ownerNombre: '', cantidadVecinos: await this.memberships.countBy({ groupId }) } : null;
  }
}
