import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:8000'],
    credentials: true,
  },
  path: '/socket.io',
})
export class JobsGateway {
  @WebSocketServer()
  server: Server;

  sendJobUpdate(job: any) {
    this.server.emit('jobStatusUpdate', job);
  }

  sendJobDeleted(jobId: string) {
    this.server.emit('jobDeleted', jobId);
  }
}
