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
import { IdPipe } from '../common/id.pipe';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post() create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }
  @Get() findAll() {
    return this.users.findAll();
  }
  @Get(':id') findOne(@Param('id', IdPipe) id: string) {
    return this.users.findOne(id);
  }
  @Patch(':id') update(
    @Param('id', IdPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.users.update(id, dto);
  }
  @Delete(':id') @HttpCode(204) remove(@Param('id', IdPipe) id: string) {
    return this.users.remove(id);
  }
}
