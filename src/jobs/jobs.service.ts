import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateJobDto } from './dto/create-job.dto';
import { Job, JobDocument } from './schemas/job.schema';
import { WorkerService } from '../worker/worker.service';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private readonly workerService: WorkerService,
  ) {}

  async create(createJobDto: CreateJobDto) {
    const newJob = new this.jobModel({
      ...createJobDto,
      status: 'queued',
    });
    const savedJob = await newJob.save();

    // publish ไป RabbitMQ
    await this.workerService.enqueueJob(savedJob._id.toString(), savedJob.message);
    this.logger.log(`[JobsService] Job ${savedJob._id} queued`);

    return savedJob;
  }

  async findAll() {
    return this.jobModel.find().exec();
  }

  async findOne(id: string) {
    return this.jobModel.findById(id).exec();
  }
}
