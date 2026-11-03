import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { TestIdentityGuard } from './test-identity.guard';

@Module({
  imports: [UsersModule],
  providers: [{ provide: APP_GUARD, useClass: TestIdentityGuard }],
})
export class TestingModule {}
