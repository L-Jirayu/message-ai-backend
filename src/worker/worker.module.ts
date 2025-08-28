import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { WorkerService } from './worker.service';
import { WorkerController } from './worker.controller';
import { Job, JobSchema } from '../jobs/schemas/job.schema';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    RabbitMQModule.forRoot({
      exchanges: [{ name: 'jobs_exchange', type: 'direct' }],
      uri: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
      connectionInitOptions: { wait: true },
    }),
    forwardRef(() => RealtimeModule),
  ],
  controllers: [WorkerController],
  providers: [WorkerService],
  exports: [WorkerService],
})
export class WorkerModule {}
