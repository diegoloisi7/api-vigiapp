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
import { IdPipe } from '../../common/id.pipe';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Roles } from '../auth/auth.decorators';

@ApiTags('Categorías')
@ApiHeader({
  name: 'X-Test-User-Id',
  required: false,
  description: 'Usuario de prueba. Si se omite, se usa el primero registrado.',
})
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}
  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear categoría (ADMIN)' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categories.create(dto);
  }
  @Get()
  @ApiOperation({ summary: 'Listar categorías' })
  findAll() {
    return this.categories.findAll();
  }
  @Get(':id')
  @ApiOperation({ summary: 'Consultar categoría por ID' })
  findOne(@Param('id', IdPipe) id: string) {
    return this.categories.findOne(id);
  }
  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar categoría (ADMIN)' })
  update(@Param('id', IdPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.categories.update(id, dto);
  }
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar categoría (ADMIN)' })
  remove(@Param('id', IdPipe) id: string) {
    return this.categories.remove(id);
  }
}
