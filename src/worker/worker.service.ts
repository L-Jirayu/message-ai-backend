import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { WorkerGateway } from './worker.gateway';
import * as amqp from 'amqplib';

@Injectable()
export class WorkerService implements OnModuleInit {
  private readonly logger = new Logger(WorkerService.name);
  private channel: amqp.Channel;
  private readonly QUEUE_NAME = 'jobs_queue';
  private readonly EXCHANGE_NAME = 'jobs_exchange';
  private readonly ROUTING_KEY = 'jobs_routing_key';

  /** เก็บ message ที่ยังไม่ถูก ack */
  private messageMap = new Map<string, amqp.Message>();

  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private readonly workerGateway: WorkerGateway,
  ) {}

  async onModuleInit() {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672');
    this.channel = await conn.createChannel();

    await this.channel.assertExchange(this.EXCHANGE_NAME, 'direct', { durable: true });
    await this.channel.assertQueue(this.QUEUE_NAME, { durable: true });
    await this.channel.bindQueue(this.QUEUE_NAME, this.EXCHANGE_NAME, this.ROUTING_KEY);
    this.channel.prefetch(1);

    this.logger.log(`[WorkerService] RabbitMQ ready: ${this.QUEUE_NAME}`);
    this.startConsumer();
  }

  /** === Producer: enqueue job === */
  async enqueueJob(jobId: string, message: string) {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    const payload = { jobId, message };
    this.channel.publish(
      this.EXCHANGE_NAME,
      this.ROUTING_KEY,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true },
    );
    this.logger.log(`[WorkerService] Job ${jobId} published to RabbitMQ`);
  }

  /** === Consumer: subscribe + mark processing === */
  private startConsumer() {
    this.channel.consume(this.QUEUE_NAME, async (msg) => {
      if (!msg) return;
      try {
        const { jobId, message } = JSON.parse(msg.content.toString());
        this.logger.log(`[WorkerService] Received job ${jobId}`);

        // mark processing in DB
        await this.markJobProcessing(jobId, message);

        // เก็บ msg ไว้ก่อน ack
        this.messageMap.set(jobId, msg);

      } catch (err) {
        this.logger.error(`[WorkerService] Error consuming job: ${err.message}`);
        this.channel.nack(msg, false, true);
      }
    });
    this.logger.log(`[WorkerService] Worker subscribed to ${this.QUEUE_NAME}`);
  }

  /** mark job processing in DB */
  private async markJobProcessing(jobId: string, message: string) {
    let job = await this.jobModel.findById(jobId);
    if (!job) {
      job = new this.jobModel({ _id: jobId, message, status: 'processing' });
    } else {
      job.status = 'processing';
    }
    await job.save();
    this.workerGateway.sendJobUpdate(job);
    this.logger.log(`[WorkerService] Job ${jobId} set to processing`);
  }

  /** === Confirm job: ack + DB update completed === */
  async confirmJob(jobId: string) {
    const job = await this.jobModel.findById(jobId);
    if (!job || job.status !== 'processing')
      throw new Error(`Job ${jobId} not found or not processing`);

    const msg = this.messageMap.get(jobId);
    if (!msg) throw new Error(`No pending message for job ${jobId}`);

    // ack message
    this.channel.ack(msg);
    this.messageMap.delete(jobId);

    // update DB
    job.resultSummary = `Processed message: ${job.message}`;
    job.category = 'mock-category';
    job.tone = 'neutral';
    job.priority = 'normal';
    job.status = 'completed';
    await job.save();

    this.workerGateway.sendJobUpdate(job);
    this.logger.log(`[WorkerService] Job ${jobId} confirmed as completed`);
    return job;
  }

  /** === Retry job: reset + enqueue === */
  async retryJob(jobId: string) {
    const job = await this.jobModel.findById(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    job.status = 'queued';
    job.resultSummary = null;
    job.category = null;
    job.tone = null;
    job.priority = null;
    job.error = null;
    await job.save();

    await this.enqueueJob(jobId, job.message);
    this.logger.log(`[WorkerService] Job ${jobId} re-queued`);
    return job;
  }

  async findAllJobs() {
    return this.jobModel.find().exec();
  }

  async findOneJob(jobId: string) {
    return this.jobModel.findById(jobId).exec();
  }
}
