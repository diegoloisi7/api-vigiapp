import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { GroupsModule } from './modules/groups/groups.module';
import { MembershipsModule } from './modules/memberships/memberships.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { TestingModule } from './modules/testing/testing.module';
import { DatabaseEntitiesModule } from './database/database-entities.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb' as const,
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: Number(config.get<string>('DB_PORT', '3306')),
        username: config.get<string>('DB_USERNAME', 'vigiapp'),
        password: config.get<string>('DB_PASSWORD', 'vigiapp'),
        database: config.get<string>('DB_DATABASE', 'vigiapp'),
        timezone: 'Z',
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    HealthModule,
    UsersModule,
    GroupsModule,
    MembershipsModule,
    CategoriesModule,
    IncidentsModule,
    TestingModule,
    DatabaseEntitiesModule,
  ],
})
export class AppModule {}
