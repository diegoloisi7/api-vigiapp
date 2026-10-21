import { randomBytes } from 'node:crypto';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { hashPassword, verifyPassword } from './password-hash';

const dummyPasswordHash = hashPassword(randomBytes(32).toString('hex'));
const ACCESS_TOKEN_TTL_SECONDS = 60 * 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
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
}
