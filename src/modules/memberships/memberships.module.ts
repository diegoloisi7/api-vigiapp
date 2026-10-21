import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Membership } from './membership.entity';
import { Group } from '../groups/group.entity';
import { MembershipsController } from './memberships.controller';
import { MembershipsService } from './memberships.service';
import { GroupAccessModule } from '../../common/group-access.module';

@Module({
  imports: [TypeOrmModule.forFeature([Membership, Group]), GroupAccessModule],
  controllers: [MembershipsController],
  providers: [MembershipsService],
})
export class MembershipsModule {}
