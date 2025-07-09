import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Form, FormDocument } from './schemas/form.schema';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';

@Injectable()
export class FormService {
  private readonly logger = new Logger(FormService.name);

  constructor(
    @InjectModel(Form.name) public formModel: Model<FormDocument>,
  ) {}

  async create(createFormDto: CreateFormDto, userId: string) {
    const created = new this.formModel({ ...createFormDto, createdBy: userId });
    return created.save();
  }

  async findAll() {
    return this.formModel.find().exec();
  }

  async findOne(id: string) {
    return this.formModel.findById(id).exec();
  }

  async update(id: string, updateFormDto: UpdateFormDto, userId: string) {
    return this.formModel.findByIdAndUpdate(
      id,
      { ...updateFormDto, updatedBy: userId },
      { new: true },
    ).exec();
  }

  async remove(id: string) {
    return this.formModel.findByIdAndDelete(id).exec();
  }
}
