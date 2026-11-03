import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Category } from '../modules/categories/category.entity';
import { ContactSubmission } from '../modules/contact/contact-submission.entity';
import { Group } from '../modules/groups/group.entity';
import { GroupInvitation } from '../modules/invitations/group-invitation.entity';
import { Incident } from '../modules/incidents/incident.entity';
import { IncidentResolutionMark } from '../modules/incidents/incident-resolution-mark.entity';
import { IncidentStatusEvent } from '../modules/incidents/incident-status-event.entity';
import { IncidentConfirmation } from '../modules/confirmations/incident-confirmation.entity';
import { IncidentMedia } from '../modules/media/incident-media.entity';
import { Membership } from '../modules/memberships/membership.entity';
import { ImportantNotice } from '../modules/notices/important-notice.entity';
import { Notification } from '../modules/notifications/notification.entity';
import { NotificationPreference } from '../modules/notifications/notification-preference.entity';
import { PushSubscription } from '../modules/notifications/push-subscription.entity';
import { User } from '../modules/users/user.entity';

export const migrationDataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'vigiapp',
  password: process.env.DB_PASSWORD ?? 'vigiapp',
  database: process.env.DB_DATABASE || 'vigiapp',
  timezone: 'Z',
  synchronize: false,
  entities: [User, Group, Membership, Category, Incident, GroupInvitation, IncidentConfirmation,
    IncidentMedia, ImportantNotice, Notification, NotificationPreference, PushSubscription,
    ContactSubmission, IncidentResolutionMark, IncidentStatusEvent],
});
