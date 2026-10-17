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
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}
  @Post() create(@Body() dto: CreateGroupDto) {
    return this.groups.create(dto);
  }
  @Get() findAll() {
    return this.groups.findAll();
  }
  @Get(':id') findOne(@Param('id', IdPipe) id: string) {
    return this.groups.findOne(id);
  }
  @Patch(':id') update(
    @Param('id', IdPipe) id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.groups.update(id, dto);
  }
  @Delete(':id') @HttpCode(204) remove(@Param('id', IdPipe) id: string) {
    return this.groups.remove(id);
  }
}
