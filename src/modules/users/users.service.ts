import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hashPassword } from '../auth/password-hash';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthenticatedUser } from '../auth/auth.types';
import { NotificationPreference } from '../notifications/notification-preference.entity';

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

  findByEmailForAuthentication(email: string) {
    return this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findPrincipalById(id: string): Promise<AuthenticatedUser | null> {
    const user = await this.users.findOneBy({ id });
    return user ? { id: String(user.id), appRole: user.appRole } : null;
  }

  async findFirstPrincipal(): Promise<AuthenticatedUser | null> {
    const [user] = await this.users.find({ order: { id: 'ASC' }, take: 1 });
    return user ? { id: String(user.id), appRole: user.appRole } : null;
  }

  async create(dto: CreateUserDto) {
    this.validateCoordinates(dto.homeLatitude, dto.homeLongitude);
    const now = new Date();
    const { password, ...userData } = dto;
    const user = await this.users.manager.transaction(async (manager) => {
      const saved = await manager.getRepository(User).save(
        manager.getRepository(User).create({
        ...userData,
        email: dto.email.trim().toLowerCase(),
        passwordHash: await hashPassword(password),
        appRole: 'USER',
        createdAt: now,
        updatedAt: now,
        }),
      );
      await manager.getRepository(NotificationPreference).save({
        userId: String(saved.id), urgentIncidentsEnabled: true,
      });
      return saved;
    });
    return this.publicUser(user);
  }

  async findAll() {
    return (await this.users.find({ order: { id: 'ASC' } })).map((user) =>
      this.publicUser(user),
    );
  }

  async findOne(id: string, actor: AuthenticatedUser) {
    if (actor.appRole !== 'ADMIN' && actor.id !== id) {
      throw new ForbiddenException('No puedes consultar otro usuario');
    }
    const user = await this.users.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return this.publicUser(user);
  }

  async update(id: string, dto: UpdateUserDto, actor: AuthenticatedUser) {
    if (actor.appRole !== 'ADMIN' && actor.id !== id) {
      throw new ForbiddenException('No puedes modificar otro usuario');
    }
    const user = await this.users.findOneBy({ id });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    this.validateCoordinates(
      dto.homeLatitude === undefined ? user.homeLatitude : dto.homeLatitude,
      dto.homeLongitude === undefined ? user.homeLongitude : dto.homeLongitude,
    );
    const data = dto;
    if (data.email !== undefined) data.email = data.email.trim().toLowerCase();
    Object.assign(user, data);
    user.updatedAt = new Date();
    return this.publicUser(await this.users.save(user));
  }

  async remove(id: string, actor: AuthenticatedUser) {
    if (actor.appRole !== 'ADMIN' && actor.id !== id) {
      throw new ForbiddenException('No puedes eliminar otro usuario');
    }
    const result = await this.users.delete(id);
    if (!result.affected) throw new NotFoundException('Usuario no encontrado');
  }
}
