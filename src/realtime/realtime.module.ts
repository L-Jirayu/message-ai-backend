// src/realtime/realtime.module.ts
import { Module } from '@nestjs/common';
import { JobsGateway } from '../jobs/jobs.gateway';

@Module({
  providers: [JobsGateway],
  exports: [JobsGateway],
})
export class RealtimeModule {}
