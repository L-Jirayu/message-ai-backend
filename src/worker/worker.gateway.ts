// worker.gateway.ts
import { WebSocketGateway } from '@nestjs/websockets';
import { JobsGateway } from '../jobs/jobs.gateway';
import { JobDocument } from '../jobs/schemas/job.schema';

@WebSocketGateway({
  cors: {
    origin: ["http://localhost:5173", "http://localhost:8000"],
    credentials: true,
  },
  path: '/socket.io',
})
export class WorkerGateway {
  constructor(private readonly jobsGateway: JobsGateway) {}

  sendJobUpdate(job: JobDocument) {
    this.jobsGateway.sendJobUpdate({
      _id: job._id.toString(),
      id:  job._id.toString(),
      name: job.name ?? '',     
      message: job.message ?? null,
      status: job.status,
      resultSummary: job.resultSummary ?? null,
      category: job.category ?? null,
      tone: job.tone ?? null,
      priority: job.priority ?? null,
      language: job.language ?? null, 
      updatedAt: job.updatedAt ?? new Date().toISOString(),
    });
  }
  
  sendJobDeleted(jobId: string) {
    this.jobsGateway.sendJobDeleted(jobId);
  }
}
