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
import { Public, Roles } from '../auth/auth.decorators';
import { IdPipe } from '../../common/id.pipe';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Registrar usuario' })
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }
  @Roles('ADMIN')
  @Get()
  @ApiOperation({ summary: 'Listar usuarios (ADMIN)' })
  findAll() {
    return this.users.findAll();
  }
  @Get('me')
  @ApiOperation({ summary: 'Consultar mi perfil' })
  findMe(@CurrentUser() user: AuthenticatedUser) {
    return this.users.findOne(user.id, user);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Consultar usuario por ID' })
  findOne(
    @Param('id', IdPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.users.findOne(id, user);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario por ID' })
  update(
    @Param('id', IdPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.users.update(id, dto, user);
  }
  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar usuario por ID' })
  remove(
    @Param('id', IdPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.users.remove(id, user);
  }
}
