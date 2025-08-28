import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateCrudDto } from './dto/update-crud.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { JobsGateway } from '../jobs/jobs.gateway';

@Injectable()
export class CrudService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private readonly jobsGateway: JobsGateway,
  ) {}

  async findAll() {
    return this.jobModel.find().exec();
  }

  async findOne(id: string) {
    const doc = await this.jobModel.findById(id).exec();
    if (!doc) throw new NotFoundException('Job not found');
    return doc;
  }

  async update(id: string, dto: UpdateCrudDto) {
    const updated = await this.jobModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    if (!updated) throw new NotFoundException('Job not found');
    this.jobsGateway.sendJobUpdate(updated); // 🔔
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.jobModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Job not found');
    this.jobsGateway.sendJobDeleted(id); // 🔔
    return { ok: true };
  }
}
