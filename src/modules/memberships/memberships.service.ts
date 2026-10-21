import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticatedUser } from '../auth/auth.types';
import { GroupAccessService } from '../../common/group-access.service';
import { Group } from '../groups/group.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { Membership } from './membership.entity';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly memberships: Repository<Membership>,
    @InjectRepository(Group)
    private readonly groups: Repository<Group>,
    private readonly groupAccess: GroupAccessService,
  ) {}

  async create(dto: CreateMembershipDto, actor: AuthenticatedUser) {
    if (
      actor.appRole !== 'ADMIN' &&
      !(await this.groupAccess.isGroupAdmin(actor.id, dto.groupId))
    ) {
      throw new ForbiddenException(
        'Solo el creador del grupo o un administrador global puede agregar vecinos',
      );
    }
    if (await this.memberships.existsBy({ userId: dto.userId })) {
      throw new ConflictException('El usuario ya pertenece a un grupo vecinal');
    }
    const membership = await this.memberships.save(
      this.memberships.create({
        userId: dto.userId,
        groupId: dto.groupId,
        groupRole: 'NEIGHBOR',
        joinedAt: new Date(),
      }),
    );
    return this.findOne(String(membership.id), actor);
  }

  async findAll(actor: AuthenticatedUser) {
    if (actor.appRole === 'ADMIN') {
      return this.memberships.find({ order: { id: 'ASC' } });
    }
    const groupIds = await this.groupAccess.groupIdsAdministeredBy(actor.id);
    return this.groupAccess.findMembershipsVisibleTo(actor.id, groupIds);
  }

  async findOne(id: string, actor: AuthenticatedUser) {
    const membership = await this.memberships.findOneBy({ id });
    if (!membership) throw new NotFoundException('Membresía no encontrada');
    if (
      actor.appRole !== 'ADMIN' &&
      membership.userId !== actor.id &&
      !(await this.groupAccess.isGroupAdmin(actor.id, membership.groupId))
    ) {
      throw new ForbiddenException('No tenés acceso a esta membresía');
    }
    return membership;
  }

  async remove(id: string, actor: AuthenticatedUser) {
    const membership = await this.findOne(id, actor);
    const group = await this.groups.findOneBy({ id: membership.groupId });
    if (group?.createdByUserId === membership.userId) {
      throw new ConflictException(
        'El creador no puede abandonar el grupo mientras exista',
      );
    }
    if (
      actor.appRole !== 'ADMIN' &&
      membership.userId !== actor.id &&
      !(await this.groupAccess.isGroupAdmin(actor.id, membership.groupId))
    ) {
      throw new ForbiddenException('No podés eliminar esta membresía');
    }
    await this.memberships.delete(id);
  }
}
