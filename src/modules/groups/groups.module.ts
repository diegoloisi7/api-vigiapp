import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { GroupAccessModule } from '../../common/group-access.module';

@Module({
  imports: [TypeOrmModule.forFeature([Group]), GroupAccessModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
