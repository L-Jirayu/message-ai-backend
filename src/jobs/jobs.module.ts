import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JobsService } from './jobs.service';
import { JobsGateway } from './jobs.gateway';
import { JobsController } from './jobs.controller';
import { Job, JobSchema } from './schemas/job.schema';
import { WorkerModule } from '../worker/worker.module'; // ✅ import WorkerModule

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    WorkerModule, // ✅ ใช้ WorkerService จาก WorkerModule
  ],
  controllers: [JobsController],
  providers: [JobsService, JobsGateway],
})
export class JobsModule {}
