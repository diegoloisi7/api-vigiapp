import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IdPipe } from '../../common/id.pipe';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { MembershipsService } from './memberships.service';

@ApiTags('Membresías')
@ApiHeader({
  name: 'X-Test-User-Id',
  required: false,
  description: 'Usuario de prueba. Si se omite, se usa el primero registrado.',
})
@Controller('memberships')
export class MembershipsController {
  constructor(private readonly memberships: MembershipsService) {}
  @Post()
  @ApiOperation({ summary: 'Crear membresía' })
  create(
    @Body() dto: CreateMembershipDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.memberships.create(dto, user);
  }
  @Get()
  @ApiOperation({ summary: 'Listar membresías visibles' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.memberships.findAll(user);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Consultar membresía por ID' })
  findOne(
    @Param('id', IdPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.memberships.findOne(id, user);
  }
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar membresía por ID' })
  remove(
    @Param('id', IdPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.memberships.remove(id, user);
  }
}
