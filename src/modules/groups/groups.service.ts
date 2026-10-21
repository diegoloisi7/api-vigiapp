import {
  ConflictException,
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

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private readonly groups: Repository<Group>,
    private readonly groupAccess: GroupAccessService,
  ) {}
  async create(dto: CreateGroupDto, actor: AuthenticatedUser) {
    if ((await this.groupAccess.groupIdsForUser(actor.id)).length > 0) {
      throw new ConflictException(
        'Un usuario puede pertenecer a un solo grupo vecinal',
      );
    }
    const now = new Date();
    return this.groups.manager.transaction(async (manager) => {
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
      const createdGroup = await groupRepository.findOneBy({
        id: String(group.id),
      });
      if (!createdGroup) throw new NotFoundException('Grupo no encontrado');
      return createdGroup;
    });
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
