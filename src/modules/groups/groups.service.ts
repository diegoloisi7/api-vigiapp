import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthenticatedUser } from '../auth/auth.types';
import { GroupAccessService } from '../../common/group-access.service';
import { Membership } from '../memberships/membership.entity';
import { User } from '../users/user.entity';
import { GroupInvitation } from '../invitations/group-invitation.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private readonly groups: Repository<Group>,
    private readonly groupAccess: GroupAccessService,
  ) {}
  private numericId(value: string): number {
    const id = Number(value);
    if (!Number.isSafeInteger(id)) throw new Error('ID fuera del rango seguro del cliente');
    return id;
  }

  private async view(group: Group, membership: Membership) {
    const manager = this.groups.manager;
    const [owner, count] = await Promise.all([
      manager.getRepository(User).findOneBy({ id: group.createdByUserId }),
      manager.getRepository(Membership).countBy({ groupId: group.id }),
    ]);
    return {
      id: this.numericId(group.id),
      nombre: group.name,
      zona: group.description ?? '',
      ownerId: this.numericId(group.createdByUserId),
      ownerNombre: owner ? `${owner.firstName} ${owner.lastName}` : '',
      cantidadVecinos: count,
      miRol: membership.groupRole === 'GROUP_ADMIN' ? 'OWNER' : 'MIEMBRO',
      centro: { lat: Number(group.centerLatitude), lng: Number(group.centerLongitude) },
      radioMetros: Number(group.radiusMeters),
    };
  }

  async findMine(actor: AuthenticatedUser) {
    const memberships = await this.groups.manager.getRepository(Membership).findBy({ userId: actor.id });
    const groups = await Promise.all(memberships.map(async (membership) => {
      const group = await this.groups.findOneBy({ id: membership.groupId });
      return group ? this.view(group, membership) : null;
    }));
    return groups.filter((group) => group !== null);
  }

  async findDetail(id: string, actor: AuthenticatedUser) {
    const group = await this.findOne(id);
    const memberships = this.groups.manager.getRepository(Membership);
    const ownMembership = await memberships.findOneBy({ userId: actor.id, groupId: id });
    if (!ownMembership && actor.appRole !== 'ADMIN') throw new ForbiddenException('No pertenecés a este grupo');
    const memberList = await memberships.findBy({ groupId: id });
    const users = this.groups.manager.getRepository(User);
    const miembros = await Promise.all(memberList.map(async (membership) => {
      const member = await users.findOneBy({ id: membership.userId });
      return {
        usuarioId: this.numericId(membership.userId),
        nombre: member?.firstName ?? '',
        apellido: member?.lastName ?? '',
        rol: membership.groupRole === 'GROUP_ADMIN' ? 'OWNER' : 'MIEMBRO',
        desde: membership.joinedAt.toISOString(),
      };
    }));
    const invitationList = ownMembership?.groupRole === 'GROUP_ADMIN' || actor.appRole === 'ADMIN'
      ? (await this.groups.manager.getRepository(GroupInvitation).findBy({ groupId: id }))
        .filter((invitation) => invitation.status !== 'REVOKED') : [];
    const invitaciones = await Promise.all(invitationList.map(async (invitation) => {
      const [invitee, sender] = await Promise.all([
        users.findOneBy({ id: invitation.invitedUserId }),
        users.findOneBy({ id: invitation.invitedByUserId }),
      ]);
      return {
        id: this.numericId(invitation.id),
        grupoId: this.numericId(id),
        grupoNombre: group.name,
        email: invitee?.email ?? '',
        estado: invitation.status === 'DECLINED' ? 'RECHAZADA' : invitation.status === 'ACCEPTED' ? 'ACEPTADA' : 'PENDIENTE',
        creada: invitation.invitedAt.toISOString(),
        invitadoPor: sender ? `${sender.firstName} ${sender.lastName}` : '',
      };
    }));
    const fallback = ownMembership ?? { groupRole: 'NEIGHBOR' } as Membership;
    return { ...(await this.view(group, fallback)), miembros, invitaciones };
  }
  async create(dto: CreateGroupDto, actor: AuthenticatedUser) {
    const now = new Date();
    const groupId = await this.groups.manager.transaction(async (manager) => {
      const groupRepository = manager.getRepository(Group);
      const group = await groupRepository.save(
        groupRepository.create({
          ...dto,
          createdByUserId: actor.id,
          createdAt: now,
          updatedAt: now,
        }),
      );
      await manager.getRepository(Membership).save({
        userId: actor.id,
        groupId: String(group.id),
        groupRole: 'GROUP_ADMIN',
        joinedAt: now,
      });
      return String(group.id);
    });
    return this.findDetail(groupId, actor);
  }
  findAll() {
    return this.groups.find({ order: { id: 'ASC' } });
  }
  async findOne(id: string) {
    const group = await this.groups.findOneBy({ id });
    if (!group) throw new NotFoundException('Grupo no encontrado');
    return group;
  }
  async update(id: string, dto: UpdateGroupDto, actor: AuthenticatedUser) {
    const group = await this.findOne(id);
    if (
      actor.appRole !== 'ADMIN' &&
      !(await this.groupAccess.isGroupAdmin(actor.id, group.id))
    ) {
      throw new ForbiddenException(
        'Solo los administradores del grupo pueden modificarlo',
      );
    }
    Object.assign(group, dto);
    group.updatedAt = new Date();
    return this.groups.save(group);
  }
  async remove(id: string, actor: AuthenticatedUser) {
    const group = await this.findOne(id);
    if (
      actor.appRole !== 'ADMIN' &&
      !(await this.groupAccess.isGroupAdmin(actor.id, group.id))
    ) {
      throw new ForbiddenException(
        'Solo los administradores del grupo pueden eliminarlo',
      );
    }
    await this.groups.manager.transaction(async (manager) => {
      await manager.getRepository(Membership).delete({ groupId: id });
      await manager.getRepository(Group).delete(id);
    });
  }
}
