import { randomBytes } from 'node:crypto';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { hashPassword, verifyPassword } from './password-hash';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';

const dummyPasswordHash = hashPassword(randomBytes(32).toString('hex'));
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.users.findByEmailForAuthentication(
      dto.email.trim().toLowerCase(),
    );
    const hashToCompare = user?.passwordHash ?? (await dummyPasswordHash);
    const passwordMatches = await verifyPassword(hashToCompare, dto.password);

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      appRole: user.appRole,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      user: {
        id: String(user.id),
        firstName: user.firstName,
        lastName: user.lastName,
        appRole: user.appRole,
      },
    };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.createQueryBuilder('user')
      .addSelect('user.passwordHash').where('user.id = :userId', { userId }).getOne();
    if (!user || !(await verifyPassword(user.passwordHash, dto.currentPassword))) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }
    user.passwordHash = await hashPassword(dto.newPassword);
    await this.userRepository.save(user);
    return { ok: true };
  }

}
