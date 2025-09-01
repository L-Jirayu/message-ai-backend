import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkerModule } from './worker/worker.module';
import { JobsModule } from './jobs/jobs.module';
import { CrudModule } from './crud/crud.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60,        // หน้าต่างเวลา 60 วินาที
      limit: 120,     // อนุญาต 120 req/นาที/ไอพี
    }]),
    MongooseModule.forRoot('mongodb://localhost:27017/jobs'),
    WorkerModule,
    JobsModule,
    CrudModule,],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard },],
})
export class AppModule {}
