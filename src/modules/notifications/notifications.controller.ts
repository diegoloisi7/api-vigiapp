import { Controller, Get, Param, Patch } from '@nestjs/common';
import { IdPipe } from '../../common/id.pipe';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notificaciones')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.notifications.mine(user);
  }

  @Patch(':id/leida')
  read(@Param('id', IdPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notifications.read(id, user);
  }
}
