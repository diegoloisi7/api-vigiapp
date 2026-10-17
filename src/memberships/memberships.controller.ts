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
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { MembershipsService } from './memberships.service';

@Controller('memberships')
export class MembershipsController {
  constructor(private readonly memberships: MembershipsService) {}
  @Post() create(@Body() dto: CreateMembershipDto) {
    return this.memberships.create(dto);
  }
  @Get() findAll() {
    return this.memberships.findAll();
  }
  @Get(':id') findOne(@Param('id', IdPipe) id: string) {
    return this.memberships.findOne(id);
  }
  @Patch(':id') update(
    @Param('id', IdPipe) id: string,
    @Body() dto: UpdateMembershipDto,
  ) {
    return this.memberships.update(id, dto);
  }
  @Delete(':id') @HttpCode(204) remove(@Param('id', IdPipe) id: string) {
    return this.memberships.remove(id);
  }
}
