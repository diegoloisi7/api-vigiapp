import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Membership } from './membership.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private readonly memberships: Repository<Membership>,
  ) {}
  async create(dto: CreateMembershipDto) {
    const membership = await this.memberships.save(
      this.memberships.create({
        ...dto,
        groupRole: dto.groupRole ?? 'NEIGHBOR',
        joinedAt: new Date(),
      }),
    );
    return this.findOne(String(membership.id));
  }
  findAll() {
    return this.memberships.find({ order: { id: 'ASC' } });
  }
  async findOne(id: string) {
    const membership = await this.memberships.findOneBy({ id });
    if (!membership) throw new NotFoundException('Membresía no encontrada');
    return membership;
  }
  async update(id: string, dto: UpdateMembershipDto) {
    const membership = await this.findOne(id);
    membership.groupRole = dto.groupRole;
    return this.memberships.save(membership);
  }
  async remove(id: string) {
    const result = await this.memberships.delete(id);
    if (!result.affected)
      throw new NotFoundException('Membresía no encontrada');
  }
}
