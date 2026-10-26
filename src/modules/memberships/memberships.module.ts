import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './membership.entity';
import { Group } from '../groups/group.entity';
import { MembershipsService } from './memberships.service';
import { GroupAccessModule } from '../../common/group-access.module';

@Module({
  imports: [TypeOrmModule.forFeature([Membership, Group]), GroupAccessModule],
  controllers: [],
  providers: [MembershipsService],
})
export class MembershipsModule {}
