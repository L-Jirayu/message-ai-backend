import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobDocument = Job & Document;

@Schema()
export class Job {
  @Prop({ required: true })
  message: string;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ default: '' })
  resultSummary: string;
}

export const JobSchema = SchemaFactory.createForClass(Job);