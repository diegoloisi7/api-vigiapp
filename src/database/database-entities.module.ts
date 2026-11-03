import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentConfirmation } from '../modules/confirmations/incident-confirmation.entity';
import { ContactSubmission } from '../modules/contact/contact-submission.entity';
import { GroupInvitation } from '../modules/invitations/group-invitation.entity';
import { IncidentMedia } from '../modules/media/incident-media.entity';
import { ImportantNotice } from '../modules/notices/important-notice.entity';
import { NotificationPreference } from '../modules/notifications/notification-preference.entity';
import { Notification } from '../modules/notifications/notification.entity';
import { PushSubscription } from '../modules/notifications/push-subscription.entity';

// Registra entidades sin exponer servicios ni rutas para las tablas aún sin módulo funcional.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      GroupInvitation,
      IncidentConfirmation,
      IncidentMedia,
      ImportantNotice,
      Notification,
      NotificationPreference,
      PushSubscription,
      ContactSubmission,
    ]),
  ],
})
export class DatabaseEntitiesModule {}
