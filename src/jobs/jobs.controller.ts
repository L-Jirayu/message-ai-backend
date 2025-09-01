import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  // POST /jobs/ingest → สร้าง job ใหม่ + enqueue
  @Post('ingest')
  @Throttle({ default: { ttl: 60, limit: 30 } })
  async create(@Body() createJobDto: CreateJobDto) {
    return this.jobsService.create(createJobDto);
  }

  // GET /jobs
  @Get()
  async findAll(
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('order') order: 'asc' | 'desc' = 'desc',
    @Query('status') status?: string,
  ) {
    return this.jobsService.findAllPaged({
      limit: Math.min(Number(limit) || 100, 500),
      cursor,
      order,
      status,
    });
  }

  // GET /jobs/:id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }
}
