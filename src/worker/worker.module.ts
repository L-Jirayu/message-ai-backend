import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { WorkerService } from './worker.service';
import { WorkerGateway } from './worker.gateway';
import { WorkerController } from './worker.controller';
import { Job, JobSchema } from '../jobs/schemas/job.schema';

@Module({
  imports: [
    // MongoDB
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),

    // RabbitMQ
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'jobs_exchange',
          type: 'direct',
        },
      ],
      uri: 'amqp://guest:guest@localhost:5672',
      connectionInitOptions: { wait: true },
    }),
  ],
  controllers: [WorkerController],
  providers: [WorkerService, WorkerGateway],
  exports: [WorkerService], // ✅ ให้ JobsModule ใช้ WorkerService ได้
})
export class WorkerModule {}
