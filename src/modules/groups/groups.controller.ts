import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { IdPipe } from '../../common/id.pipe';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

@ApiTags('Grupos')
@ApiHeader({
  name: 'X-Test-User-Id',
  required: false,
  description: 'Usuario de prueba. Si se omite, se usa el primero registrado.',
})
@Controller('groups')
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}
  @Post()
  @ApiOperation({ summary: 'Crear grupo vecinal' })
  create(@Body() dto: CreateGroupDto, @CurrentUser() user: AuthenticatedUser) {
    return this.groups.create(dto, user);
  }
  @Get()
  @ApiOperation({ summary: 'Listar grupos vecinales' })
  findAll() {
    return this.groups.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Consultar grupo por ID' })
  findOne(@Param('id', IdPipe) id: string) {
    return this.groups.findOne(id);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar grupo por ID' })
  update(
    @Param('id', IdPipe) id: string,
    @Body() dto: UpdateGroupDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.groups.update(id, dto, user);
  }
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar grupo por ID' })
  remove(
    @Param('id', IdPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.groups.remove(id, user);
  }
}
