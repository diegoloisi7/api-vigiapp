import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth.types';
import { IdPipe } from '../../common/id.pipe';
import { IncidentViewsService } from './incident-views.service';

@Controller('incidencias')
export class IncidentsController {
  constructor(private readonly views: IncidentViewsService) {}

  @Get('mias')
  mine(@Query('grupoId') groupId: string | undefined, @CurrentUser() user: AuthenticatedUser) {
    return this.views.list(groupId, true, user);
  }

  @Get()
  list(@Query('grupoId') groupId: string | undefined, @CurrentUser() user: AuthenticatedUser) {
    return this.views.list(groupId, false, user);
  }

  @Get(':id')
  get(@Param('id', IdPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.views.get(id, user);
  }

  @Get(':id/foto')
  async photo(@Param('id', IdPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    const photo = await this.views.photo(id, user);
    return new StreamableFile(photo.buffer, { type: photo.type });
  }

  @Post()
  @UseInterceptors(FileInterceptor('foto', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async create(@Body() body: Record<string, unknown>, @UploadedFile() file: { buffer: Buffer; mimetype: string; size: number } | undefined,
    @CurrentUser() user: AuthenticatedUser) {
    if (file && (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype) || file.size > 5 * 1024 * 1024)) {
      throw new BadRequestException('Tipo o tamaño de foto inválido');
    }
    const input = {
      titulo: body.titulo as string, categoriaId: body.categoriaId as string,
      descripcion: body.descripcion as string, ubicacion: body.ubicacion as string,
      lat: body.lat == null ? null : Number(body.lat), lng: body.lng == null ? null : Number(body.lng),
      grupoId: body.grupoId == null ? undefined : Number(body.grupoId),
      vigenciaDias: body.vigenciaDias == null ? undefined : Number(body.vigenciaDias),
    };
    const result = await this.views.createNormal(input, user);
    return file ? this.views.storePhoto(String(result.id), file, user) : result;
  }

  @Post('urgentes')
  urgent(@Body() body: Parameters<IncidentViewsService['createUrgent']>[0], @CurrentUser() user: AuthenticatedUser) {
    return this.views.createUrgent(body, user);
  }

  @Patch(':id')
  update(@Param('id', IdPipe) id: string, @Body() body: Parameters<IncidentViewsService['update']>[1], @CurrentUser() user: AuthenticatedUser) {
    return this.views.update(id, body, user);
  }

  @Patch(':id/estado')
  status(@Param('id', IdPipe) id: string, @Body() body: { estado: string; nota?: string }, @CurrentUser() user: AuthenticatedUser) {
    return this.views.changeStatus(id, body.estado, body.nota, user);
  }

  @Post(':id/confirmaciones')
  confirm(@Param('id', IdPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.views.confirm(id, false, user);
  }

  @Delete(':id/confirmaciones')
  unconfirm(@Param('id', IdPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.views.unconfirm(id, user);
  }

  @Post(':id/ya-resuelto')
  resolved(@Param('id', IdPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.views.confirm(id, true, user);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', IdPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.views.remove(id, user);
  }
}
