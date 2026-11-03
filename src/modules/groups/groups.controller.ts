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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/auth.decorators';
import { IdPipe } from '../../common/id.pipe';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

@ApiTags('Grupos')
@Controller('grupos')
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}
  @Post()
  @ApiOperation({ summary: 'Crear grupo vecinal' })
  create(@Body() dto: CreateGroupDto, @CurrentUser() user: AuthenticatedUser) {
    return this.groups.create(dto, user);
  }
  @Get('mios')
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.groups.findMine(user);
  }
  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Listar grupos vecinales' })
  findAll() {
    return this.groups.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Consultar grupo por ID' })
  findOne(@Param('id', IdPipe) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.groups.findDetail(id, user);
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
