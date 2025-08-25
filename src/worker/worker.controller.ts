import { Controller, Get, Post, Patch, Param, NotFoundException } from '@nestjs/common';
import { WorkerService } from './worker.service';

@Controller('worker')
export class WorkerController {
  constructor(private readonly workerService: WorkerService) {}

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
