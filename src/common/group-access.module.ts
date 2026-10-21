import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../modules/groups/group.entity';
import { Membership } from '../modules/memberships/membership.entity';
import { GroupAccessService } from './group-access.service';

@Module({
  imports: [TypeOrmModule.forFeature([Membership, Group])],
  providers: [GroupAccessService],
  exports: [GroupAccessService],
})
export class GroupAccessModule {}
