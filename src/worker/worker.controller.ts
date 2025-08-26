import { Controller, Get, Patch, Param, Post, Body, NotFoundException } from '@nestjs/common';
import { WorkerService } from './worker.service';

@Controller('worker')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

  // POST /worker/send/:id/:message → สั่งส่ง job เข้า queue
  @Post('send/:id/:message')
  async sendJob(@Param('id') id: string, @Param('message') message: string) {
    await this.workerService.enqueueJob(id, message);
    return { jobId: id, message, status: 'queued' };
  }

  @Patch('confirm/:id')
  async confirmJob(@Param('id') id: string) {
    const job = await this.workerService.confirmJob(id);
    if (!job) throw new NotFoundException(`Job ${id} not found or not processing`);
    return job;
  }

  @Patch('retry/:id')
  async retryJob(@Param('id') id: string) {
    return this.workerService.retryJob(id);
  }

  @Get('jobs')
  async findAllJobs() {
    return this.workerService.findAllJobs();
  }

  @Get('jobs/:id')
  async findOneJob(@Param('id') id: string) {
    const job = await this.workerService.findOneJob(id);
    if (!job) throw new NotFoundException(`Job ${id} not found`);
    return job;
  }
}
