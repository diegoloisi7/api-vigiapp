import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from '../auth/auth.decorators';

@ApiTags('Salud')
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Comprobar API y conexión a MariaDB' })
  async check() {
    await this.dataSource.query('SELECT 1');
    return {
      status: 'ok',
      service: 'vigiapp-api',
      database: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
