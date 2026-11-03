import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY, ROLES_KEY } from '../auth/auth.decorators';
import { AppRole, AuthenticatedUser } from '../auth/auth.types';
import { UsersService } from '../users/users.service';

interface TestRequest {
  headers: { 'x-test-user-id'?: string | string[] };
  user?: AuthenticatedUser;
}

@Injectable()
export class TestIdentityGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, targets)) {
      return true;
    }

    const request = context.switchToHttp().getRequest<TestRequest>();
    const testUserId = request.headers['x-test-user-id'];
    if (
      testUserId !== undefined &&
      (typeof testUserId !== 'string' ||
        !/^[1-9]\d*$/.test(testUserId) ||
        BigInt(testUserId) > 18446744073709551615n)
    ) {
      throw new BadRequestException('X-Test-User-Id debe ser un ID válido');
    }

    const user = testUserId
      ? await this.users.findPrincipalById(testUserId)
      : await this.users.findFirstPrincipal();
    if (!user) {
      throw new BadRequestException(
        'No existe el usuario de prueba. Regístralo con POST /api/users o usa otro X-Test-User-Id.',
      );
    }
    request.user = user;

    const requiredRoles = this.reflector.getAllAndOverride<AppRole[]>(
      ROLES_KEY,
      targets,
    );
    if (requiredRoles?.length && !requiredRoles.includes(user.appRole)) {
      throw new ForbiddenException('El usuario de prueba no tiene ese rol');
    }
    return true;
  }
}
