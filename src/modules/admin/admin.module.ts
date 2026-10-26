import { Module } from '@nestjs/common';
import { IncidentsModule } from '../incidents/incidents.module';
import { NoticesModule } from '../notices/notices.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [IncidentsModule, NoticesModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
