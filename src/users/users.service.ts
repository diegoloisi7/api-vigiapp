import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  private validateCoordinates(
    latitude?: number | null,
    longitude?: number | null,
  ) {
    if ((latitude == null) !== (longitude == null)) {
      throw new BadRequestException(
        'La latitud y longitud del domicilio deben enviarse juntas',
      );
    }
  }

  // address y coordenadas del domicilio tampoco forman parte de la respuesta pública.
  private publicUser(user: User) {
    const { id, firstName, lastName, email, appRole, createdAt, updatedAt } =
      user;
    return {
      id: String(id),
      firstName,
      lastName,
      email,
      appRole,
      createdAt,
      updatedAt,
    };
  }

  async create(dto: CreateUserDto) {
    this.validateCoordinates(dto.homeLatitude, dto.homeLongitude);
    const { password, ...data } = dto;
    const now = new Date();
    const user = await this.users.save(
      this.users.create({
        ...data,
        passwordHash: await hash(password, 12),
        appRole: 'USER',
        createdAt: now,
        updatedAt: now,
      }),
    );
    return this.publicUser(user);
  }

  async findAll() {
    return (await this.users.find({ order: { id: 'ASC' } })).map((user) =>
      this.publicUser(user),
    );
  }

  async findOne(id: string) {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.publicUser(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.users.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    this.validateCoordinates(
      dto.homeLatitude === undefined ? user.homeLatitude : dto.homeLatitude,
      dto.homeLongitude === undefined ? user.homeLongitude : dto.homeLongitude,
    );
    const { password, ...data } = dto;
    Object.assign(user, data);
    if (password !== undefined) user.passwordHash = await hash(password, 12);
    user.updatedAt = new Date();
    return this.publicUser(await this.users.save(user));
  }

  async remove(id: string) {
    const result = await this.users.delete(id);
    if (!result.affected) throw new NotFoundException('Usuario no encontrado');
  }
}
