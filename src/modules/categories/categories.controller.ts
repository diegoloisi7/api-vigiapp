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
import { IdPipe } from '../../common/id.pipe';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Public, Roles } from '../auth/auth.decorators';

@ApiTags('Categorías')
@Controller('categorias')
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}
  private view(category: { id: string; name: string; icon: string | null; active: boolean }) {
    return { id: String(category.id), nombre: category.name, icono: category.icon ?? '📌', activa: category.active };
  }
  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Crear categoría (ADMIN)' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.view(await this.categories.create(dto));
  }
  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar categorías' })
  async findAll() {
    return (await this.categories.findAll()).map((item) => this.view(item));
  }
  @Get(':id')
  @ApiOperation({ summary: 'Consultar categoría por ID' })
  async findOne(@Param('id', IdPipe) id: string) {
    return this.view(await this.categories.findOne(id));
  }
  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Actualizar categoría (ADMIN)' })
  async update(@Param('id', IdPipe) id: string, @Body() dto: UpdateCategoryDto) {
    return this.view(await this.categories.update(id, dto));
  }
  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar categoría (ADMIN)' })
  remove(@Param('id', IdPipe) id: string) {
    return this.categories.remove(id);
  }
}
