import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from '../jobs/schemas/job.schema';
import { JobsGateway } from '../jobs/jobs.gateway';
import * as amqp from 'amqplib';
import axios from 'axios';

@Injectable()
export class WorkerService implements OnModuleInit {
  private readonly logger = new Logger(WorkerService.name);
  private channel: amqp.Channel;
  private readonly QUEUE_NAME = 'jobs_queue';
  private readonly EXCHANGE_NAME = 'jobs_exchange';
  private readonly ROUTING_KEY = 'jobs_routing_key';
  private messageMap = new Map<string, amqp.Message>();

  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    private readonly jobsGateway: JobsGateway,
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

  async enqueueJob(jobId: string, message: string, isRetry = false) {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    const payload = { jobId, message, isRetry };
    this.channel.publish(this.EXCHANGE_NAME, this.ROUTING_KEY, Buffer.from(JSON.stringify(payload)), { persistent: true });
    this.logger.log(`[WorkerService] Job ${jobId} published (retry=${isRetry})`);
  }

  private startConsumer() {
    this.channel.consume(this.QUEUE_NAME, async (msg) => {
      if (!msg) return;
      try {
        const { jobId, message, isRetry } = JSON.parse(msg.content.toString());
        this.logger.log(`[WorkerService] Received job ${jobId}, retry=${isRetry}`);
        await this.markJobProcessing(jobId, message);
        if (isRetry) {
          this.messageMap.set(jobId, msg);
        } else {
          await this.processJobImmediately(jobId, msg);
        }
      } catch (err) {
        this.logger.error(`[WorkerService] Error: ${err.message}`);
        this.channel.nack(msg, false, true);
      }
    });
    this.logger.log(`[WorkerService] Subscribed to ${this.QUEUE_NAME}`);
  }

  private async markJobProcessing(jobId: string, message: string) {
    let job = await this.jobModel.findById(jobId);
    if (!job) {
      job = new this.jobModel({ _id: jobId, message, status: 'processing' });
    } else {
      job.status = 'processing';
    }
    await job.save();
    this.jobsGateway.sendJobUpdate(job);
  }

  async confirmJob(jobId: string) {
    const job = await this.jobModel.findById(jobId);
    if (!job || job.status !== 'processing') throw new Error(`Job ${jobId} not found or not processing`);
    const msg = this.messageMap.get(jobId);
    if (!msg) throw new Error(`No pending message for job ${jobId}`);
    this.channel.ack(msg);
    this.messageMap.delete(jobId);
    return this.processJob(job);
  }

  async retryJob(jobId: string) {
    const job = await this.jobModel.findById(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);
    job.status = 'queued';
    job.resultSummary = null;
    job.category = null;
    job.priority = null;
    job.error = null;
    await job.save();
    await this.enqueueJob(jobId, job.message, true);
    return job;
  }

  async findAllJobs() {
    return this.jobModel.find().exec();
  }

  async findOneJob(jobId: string) {
    return this.jobModel.findById(jobId).exec();
  }

  async processJob(job: JobDocument) {
    try {
      const response = await axios.post('https://89538fd4dec3.ngrok-free.app/v1/analyze', {
        text: job.message,
        language: 'auto',
      });
      const allowed = ["low","medium","high"];
      const aiResult = response.data.result;
      job.resultSummary = aiResult.summary;
      job.category = aiResult.category;
      job.priority = allowed.includes(aiResult.urgency) ? aiResult.urgency : "medium";
      job.language = aiResult.language;
      job.status = 'completed';
      await job.save();
      this.jobsGateway.sendJobUpdate(job);
      return job;
    } catch (error: any) {
      this.logger.error(`[WorkerService] AI error: ${error.message}`);
      job.status = 'failed';
      job.error = error.message;
      await job.save();
      this.jobsGateway.sendJobUpdate(job);
      throw error;
    }
  }

  private async processJobImmediately(jobId: string, msg: amqp.Message) {
    try {
      const job = await this.jobModel.findById(jobId);
      if (!job) throw new Error(`Job ${jobId} not found`);
      job.status = 'processing';
      await job.save();
      this.jobsGateway.sendJobUpdate(job);
      await this.processJob(job);
      this.channel.ack(msg);
    } catch (error) {
      this.channel.nack(msg, false, true);
      throw error;
    }
  }
}