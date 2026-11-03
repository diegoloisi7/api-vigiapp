import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Incident } from './incident.entity';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { GroupAccessModule } from '../../common/group-access.module';
import { IncidentConfirmation } from '../confirmations/incident-confirmation.entity';
import { IncidentMedia } from '../media/incident-media.entity';
import { IncidentResolutionMark } from './incident-resolution-mark.entity';
import { IncidentStatusEvent } from './incident-status-event.entity';
import { IncidentViewsService } from './incident-views.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forFeature([Incident, IncidentConfirmation, IncidentMedia, IncidentResolutionMark, IncidentStatusEvent]), GroupAccessModule, NotificationsModule],
  controllers: [IncidentsController],
  providers: [IncidentsService, IncidentViewsService],
  exports: [IncidentsService, IncidentViewsService],
})
export class IncidentsModule {}
