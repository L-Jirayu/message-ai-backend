import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class JobsGateway {
  @WebSocketServer()
  server: Server;

  sendJobUpdate(job: any) {
    this.server.emit('jobStatusUpdate', job);
  }
}
