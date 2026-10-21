import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdPipe } from '../../common/id.pipe';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { ListIncidentsDto } from './dto/list-incidents.dto';
import { IncidentsService } from './incidents.service';

@ApiTags('Incidentes')
@ApiHeader({
  name: 'X-Test-User-Id',
  required: false,
  description: 'Usuario de prueba. Si se omite, se usa el primero registrado.',
})
@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidents: IncidentsService) {}
  @Post()
  @ApiOperation({ summary: 'Reportar incidente' })
  create(
    @Body() dto: CreateIncidentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidents.create(dto, user);
  }
  @Get()
  @ApiOperation({ summary: 'Listar incidentes visibles' })
  findAll(
    @Query() query: ListIncidentsDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidents.findAll(query, user);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Consultar incidente por ID' })
  findOne(
    @Param('id', IdPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidents.getOne(id, user);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar incidente por ID' })
  update(
    @Param('id', IdPipe) id: string,
    @Body() dto: UpdateIncidentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidents.update(id, dto, user);
  }
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Descartar incidente por ID' })
  remove(
    @Param('id', IdPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.incidents.remove(id, user);
  }
}
