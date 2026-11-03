import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}
  async create(dto: CreateCategoryDto) {
    const category = await this.categories.save(this.categories.create(dto));
    return this.findOne(String(category.id));
  }
  findAll() {
    return this.categories.find({ order: { name: 'ASC' } });
  }
  async findOne(id: string) {
    const category = await this.categories.findOneBy({ id });
    if (!category) throw new NotFoundException('Categoría no encontrada');
    return category;
  }
  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, dto);
    return this.categories.save(category);
  }
  async remove(id: string) {
    const result = await this.categories.delete(id);
    if (!result.affected)
      throw new NotFoundException('Categoría no encontrada');
  }
}
