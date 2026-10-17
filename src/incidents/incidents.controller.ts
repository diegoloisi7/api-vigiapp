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
import { IdPipe } from '../common/id.pipe';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { ListIncidentsDto } from './dto/list-incidents.dto';
import { IncidentsService } from './incidents.service';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidents: IncidentsService) {}
  @Post() create(@Body() dto: CreateIncidentDto) {
    return this.incidents.create(dto);
  }
  @Get() findAll(@Query() query: ListIncidentsDto) {
    return this.incidents.findAll(query);
  }
  @Get(':id') findOne(@Param('id', IdPipe) id: string) {
    return this.incidents.getOne(id);
  }
  @Patch(':id') update(
    @Param('id', IdPipe) id: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.incidents.update(id, dto);
  }
  @Delete(':id') @HttpCode(204) remove(@Param('id', IdPipe) id: string) {
    return this.incidents.remove(id);
  }
}
