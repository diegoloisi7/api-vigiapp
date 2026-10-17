import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private readonly groups: Repository<Group>,
  ) {}
  async create(dto: CreateGroupDto) {
    const now = new Date();
    const group = await this.groups.save(
      this.groups.create({ ...dto, createdAt: now, updatedAt: now }),
    );
    return this.findOne(String(group.id));
  }
  findAll() {
    return this.groups.find({ order: { id: 'ASC' } });
  }
  async findOne(id: string) {
    const group = await this.groups.findOneBy({ id });
    if (!group) throw new NotFoundException('Grupo no encontrado');
    return group;
  }
  async update(id: string, dto: UpdateGroupDto) {
    const group = await this.findOne(id);
    Object.assign(group, dto);
    group.updatedAt = new Date();
    return this.groups.save(group);
  }
  async remove(id: string) {
    const result = await this.groups.delete(id);
    if (!result.affected) throw new NotFoundException('Grupo no encontrado');
  }
}
