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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}
  @Post() create(@Body() dto: CreateCategoryDto) {
    return this.categories.create(dto);
  }
  @Get() findAll() {
    return this.categories.findAll();
  }
  @Get(':id') findOne(@Param('id', IdPipe) id: string) {
    return this.categories.findOne(id);
  }
  @Patch(':id') update(
    @Param('id', IdPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categories.update(id, dto);
  }
  @Delete(':id') @HttpCode(204) remove(@Param('id', IdPipe) id: string) {
    return this.categories.remove(id);
  }
}
