import { Injectable } from '@nestjs/common';
import { UpdateCrudDto } from './dto/update-crud.dto';
import { Job } from './schemas/crud.schema'; 
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CrudService {
  constructor(@InjectModel(Job.name) private jobModel: Model<Job>) {}

  async findAll() {
    return this.jobModel.find().exec();
  }

  async findOne(id: string) {
    return this.jobModel.findById(id).exec();
  }

  async update(id: string, dto: UpdateCrudDto) {
    return this.jobModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async remove(id: string) {
    return this.jobModel.findByIdAndDelete(id).exec();
  }
}

