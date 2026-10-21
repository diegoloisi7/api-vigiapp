import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Membership } from '../modules/memberships/membership.entity';
import { Group } from '../modules/groups/group.entity';

@Injectable()
export class GroupAccessService {
  constructor(
    @InjectRepository(Membership)
    private readonly memberships: Repository<Membership>,
    @InjectRepository(Group)
    private readonly groups: Repository<Group>,
  ) {}

  async isCoordinateInsideGroup(
    groupId: string,
    latitude: number,
    longitude: number,
  ): Promise<boolean> {
    const group = await this.groups.findOneBy({ id: groupId });
    if (!group) throw new NotFoundException('Grupo no encontrado');

    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const latitude1 = toRadians(Number(group.centerLatitude));
    const latitude2 = toRadians(latitude);
    const latitudeDifference = latitude2 - latitude1;
    const longitudeDifference = toRadians(
      longitude - Number(group.centerLongitude),
    );
    const haversine =
      Math.sin(latitudeDifference / 2) ** 2 +
      Math.cos(latitude1) *
        Math.cos(latitude2) *
        Math.sin(longitudeDifference / 2) ** 2;
    const normalizedHaversine = Math.min(1, Math.max(0, haversine));
    const centralAngle =
      2 *
      Math.atan2(
        Math.sqrt(normalizedHaversine),
        Math.sqrt(1 - normalizedHaversine),
      );
    const distanceMeters = 6_371_008.8 * centralAngle;

    return distanceMeters <= Number(group.radiusMeters);
  }

  isMember(userId: string, groupId: string): Promise<boolean> {
    return this.memberships.existsBy({ userId, groupId });
  }

  isGroupAdmin(userId: string, groupId: string): Promise<boolean> {
    return this.memberships
      .createQueryBuilder('membership')
      .innerJoin(Group, 'group', 'group.id = membership.group_id')
      .where('membership.user_id = :userId', { userId })
      .andWhere('membership.group_id = :groupId', { groupId })
      .andWhere('membership.group_role = :role', { role: 'GROUP_ADMIN' })
      .andWhere('group.created_by_user_id = :userId', { userId })
      .getExists();
  }

  async groupIdsForUser(userId: string): Promise<string[]> {
    const memberships = await this.memberships.find({
      select: { groupId: true },
      where: { userId },
    });
    return memberships.map(({ groupId }) => String(groupId));
  }

  async groupIdsAdministeredBy(userId: string): Promise<string[]> {
    const memberships = await this.memberships
      .createQueryBuilder('membership')
      .innerJoin(Group, 'group', 'group.id = membership.group_id')
      .select('membership.group_id', 'groupId')
      .where('membership.user_id = :userId', { userId })
      .andWhere('membership.group_role = :role', { role: 'GROUP_ADMIN' })
      .andWhere('group.created_by_user_id = :userId', { userId })
      .getRawMany<{ groupId: string }>();
    return memberships.map(({ groupId }) => String(groupId));
  }

  findMembershipsVisibleTo(userId: string, groupIds: string[]) {
    if (groupIds.length === 0) return this.memberships.findBy({ userId });
    return this.memberships.findBy([{ userId }, { groupId: In(groupIds) }]);
  }
}
