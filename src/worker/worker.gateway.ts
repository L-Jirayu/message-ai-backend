// worker/worker.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JobDocument } from '../jobs/schemas/job.schema';


@WebSocketGateway({
  cors: {
    origin: '*', // สำหรับ dev ให้ frontend ทุก origin connect ได้
  },
})
export class WorkerGateway {
  @WebSocketServer()
  server: Server;

  /**
   * ส่ง event update job ไป frontend
   * @param job Job document
   */
    sendJobUpdate(job: JobDocument) {
    this.server.emit('jobUpdate', {
        jobId: job._id.toString(),
        status: job.status,
        resultSummary: job.resultSummary,
        category: job.category,
        tone: job.tone,
        priority: job.priority,
        updatedAt: job.updatedAt,
    });
    }
}
