import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GroupAccessService } from '../../common/group-access.service';
import { UsersService } from '../users/users.service';

@Injectable()
@WebSocketGateway({ cors: { origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true } })
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  constructor(private readonly jwt: JwtService, private readonly users: UsersService, private readonly access: GroupAccessService) {}

  async handleConnection(client: Socket) {
    try {
      const token: unknown = client.handshake.auth?.token;
      if (typeof token !== 'string') throw new Error('Token requerido');
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      const user = await this.users.findPrincipalById(payload.sub);
      if (!user) throw new Error('Usuario no encontrado');
      client.data.userId = user.id;
      const groupIds = await this.access.groupIdsForUser(user.id);
      await Promise.all(groupIds.map((id) => client.join(`group:${id}`)));
      await client.join(`user:${user.id}`);
    } catch {
      client.disconnect(true);
    }
  }

  async urgent(groupId: string, incidentId: string, recipientIds: string[]) {
    if (!this.server) return;
    const payload = {
      groupId: Number(groupId), incidentId: Number(incidentId),
      message: 'Se reportó una emergencia en tu grupo',
    };
    const allowed = new Set(recipientIds);
    const sockets = await this.server.in(`group:${groupId}`).fetchSockets();
    sockets.filter((socket) => allowed.has(String(socket.data.userId)))
      .forEach((socket) => socket.emit('incident:urgent', payload));
  }
}
