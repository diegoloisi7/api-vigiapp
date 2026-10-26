import { Body, Controller, Delete, Get, HttpCode, Param, Post } from '@nestjs/common';
import { IsBoolean, IsEmail } from 'class-validator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { IdPipe } from '../../common/id.pipe';
import { InvitationsService } from './invitations.service';

class InviteDto {
  @IsEmail()
  email!: string;
}

class RespondDto {
  @IsBoolean()
  aceptar!: boolean;
}

@Controller('grupos/:groupId/invitaciones')
export class GroupInvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Post()
  invite(@Param('groupId', IdPipe) groupId: string, @Body() dto: InviteDto, @CurrentUser() user: AuthenticatedUser) {
    return this.invitations.invite(groupId, dto.email, user);
  }

  @Delete(':id')
  @HttpCode(204)
  cancel(@Param('groupId', IdPipe) groupId: string, @Param('id', IdPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.invitations.cancel(groupId, id, user);
  }
}

@Controller('invitaciones')
export class InvitationsController {
  constructor(private readonly invitations: InvitationsService) {}

  @Get('mias')
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.invitations.mine(user);
  }

  @Post(':id/respuesta')
  respond(@Param('id', IdPipe) id: string, @Body() dto: RespondDto, @CurrentUser() user: AuthenticatedUser) {
    return this.invitations.respond(id, dto.aceptar, user);
  }
}
