import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from '../groups/group.entity';
import { Membership } from '../memberships/membership.entity';
import { User } from '../users/user.entity';
import { GroupInvitation } from './group-invitation.entity';
import { InvitationsController, GroupInvitationsController } from './invitations.controller';
import { InvitationsService } from './invitations.service';

@Module({
  imports: [TypeOrmModule.forFeature([Group, Membership, User, GroupInvitation])],
  controllers: [InvitationsController, GroupInvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
