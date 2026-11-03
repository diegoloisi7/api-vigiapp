import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { IdPipe } from '../../common/id.pipe';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { NoticesService } from './notices.service';

@Controller('avisos')
export class NoticesController {
  constructor(private readonly notices: NoticesService) {}

  @Get('mios')
  mine(@Query('grupoId') groupId: string | undefined, @CurrentUser() user: AuthenticatedUser) {
    return this.notices.list(groupId, true, user);
  }

  @Get()
  list(@Query('grupoId') groupId: string | undefined, @CurrentUser() user: AuthenticatedUser) {
    return this.notices.list(groupId, false, user);
  }

  @Post()
  create(@Body() body: Parameters<NoticesService['create']>[0], @CurrentUser() user: AuthenticatedUser) {
    return this.notices.create(body, user);
  }

  @Patch(':id')
  update(@Param('id', IdPipe) id: string, @Body() body: Parameters<NoticesService['update']>[1], @CurrentUser() user: AuthenticatedUser) {
    return this.notices.update(id, body, user);
  }

  @Post(':id/cierre')
  close(@Param('id', IdPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.notices.close(id, user);
  }
}
