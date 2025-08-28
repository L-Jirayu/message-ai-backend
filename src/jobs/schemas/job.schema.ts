// src/jobs/schemas/job.schema.ts  (ใช้ไฟล์นี้เป็นแหล่งความจริงเพียงไฟล์เดียว)
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JobDocument = Job & Document & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true })
  message: string;

  @Prop({ type: String, default: '' })
  name: string;

  @Prop({ 
    default: 'queued', 
    enum: ['queued', 'processing', 'completed', 'failed'] 
  })
  status: 'queued' | 'processing' | 'completed' | 'failed';

  @Prop({ type: String, default: null })
  resultSummary: string | null;

  @Prop({ type: String, default: null })
  category: string | null;

  @Prop({ type: String, default: null })
  tone: string | null;

  @Prop({ type: String, default: null })
  priority: string | null;

  @Prop({ type: String, default: null })
  language: string | null;

  @Prop({ type: String, default: null })
  error: string | null;
}

export const JobSchema = SchemaFactory.createForClass(Job);
