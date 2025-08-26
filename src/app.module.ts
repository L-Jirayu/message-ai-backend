import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkerModule } from './worker/worker.module';
import { JobsModule } from './jobs/jobs.module';
import { CrudModule } from './crud/crud.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/jobs'),
    WorkerModule,
    JobsModule,
    CrudModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
