import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateJobDto } from './dto/create-job.dto';
import { Job, JobDocument } from './schemas/job.schema';
import { WorkerService } from '../worker/worker.service';
import { JobsGateway } from './jobs.gateway';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private readonly workerService: WorkerService,
    private readonly jobsGateway: JobsGateway,
  ) {}

  async create(createJobDto: CreateJobDto) {
    const newJob = new this.jobModel({
      ...createJobDto,
      status: 'queued',
    });
    const savedJob = await newJob.save();
    this.jobsGateway.sendJobUpdate(savedJob);

    // publish ไป RabbitMQ
    this.workerService.enqueueJob(savedJob._id.toString(), savedJob.message)
      .catch(err => this.logger.error('enqueueJob failed', err));
    return savedJob;

  }

  async findAllPaged(q: { limit: number; cursor?: string; order?: 'asc'|'desc'; status?: string; }) {
    const { limit = 100, cursor, order = 'desc', status } = q;
    const sortDir = order === 'asc' ? 1 : -1;

    const where: any = {};
    if (status) where.status = status;

    if (cursor) {
      const oid = new Types.ObjectId(cursor);
      where._id = sortDir === -1 ? { $lt: oid } : { $gt: oid };
    }

    const docs = await this.jobModel
      .find(where)
      .sort({ _id: sortDir })
      .limit(limit + 1) // เผื่อเช็ค hasMore
      .select({
        name: 1, message: 1, status: 1,
        resultSummary: 1, category: 1, priority: 1,
        language: 1, error: 1, createdAt: 1, updatedAt: 1,
      })
      .lean()
      .exec();

    const hasMore = docs.length > limit;
    const page = hasMore ? docs.slice(0, limit) : docs;
    const nextCursor = page.length ? String(page[page.length - 1]._id) : null;

    return { data: page, meta: { limit, order, hasMore, nextCursor } };
  }

  async findOne(id: string) {
    return this.jobModel.findById(id).exec();
  }
}
