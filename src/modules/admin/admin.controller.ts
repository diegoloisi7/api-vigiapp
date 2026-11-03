import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { IdPipe } from '../../common/id.pipe';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/auth.decorators';
import { AdminService } from './admin.service';

@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('estadisticas') stats() { return this.admin.stats(); }
  @Get('grupos') groups() { return this.admin.groups(); }
  @Patch('grupos/:id') updateGroup(@Param('id', IdPipe) id: string, @Body() body: { nombre?: string; zona?: string }) {
    return this.admin.updateGroup(id, body);
  }
  @Delete('grupos/:id') @HttpCode(204)
  deleteGroup(@Param('id', IdPipe) id: string) { return this.admin.deleteGroup(id); }

  @Get('usuarios') users() { return this.admin.users(); }
  @Patch('usuarios/:id') updateUser(@Param('id', IdPipe) id: string,
    @Body() body: { nombre?: string; apellido?: string; email?: string; rol?: 'VECINO' | 'ADMINISTRADOR' },
    @CurrentUser() user: AuthenticatedUser) { return this.admin.updateUser(id, body, user); }
  @Delete('usuarios/:id') @HttpCode(204)
  deleteUser(@Param('id', IdPipe) id: string, @CurrentUser() user: AuthenticatedUser) { return this.admin.deleteUser(id, user); }
  @Delete('incidencias/:id') @HttpCode(204)
  deleteIncident(@Param('id', IdPipe) id: string, @CurrentUser() user: AuthenticatedUser) { return this.admin.deleteIncident(id, user); }
  @Delete('avisos/:id') @HttpCode(204)
  deleteNotice(@Param('id', IdPipe) id: string, @CurrentUser() user: AuthenticatedUser) { return this.admin.deleteNotice(id, user); }

  @Post('categorias') createCategory(@Body() body: { nombre: string; icono: string }) { return this.admin.createCategory(body); }
  @Patch('categorias/:id') updateCategory(@Param('id', IdPipe) id: string,
    @Body() body: { nombre?: string; icono?: string; activa?: boolean }) { return this.admin.updateCategory(id, body); }
}
