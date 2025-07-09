import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Editorial, EditorialDocument } from './schemas/editorial.schema';
import { CreateEditorialDto } from './dto/create-editorial.dto';
import { UpdateEditorialDto } from './dto/update-editorial.dto';
import { EditorialPaginationQuery } from './filters/editorial.filter';

@Injectable()
export class EditorialService {
  private readonly logger = new Logger(EditorialService.name);

  constructor(
    @InjectModel(Editorial.name) public editorialModel: Model<EditorialDocument>,
  ) {}

  async create(createEditorialDto: CreateEditorialDto, userId: string) {
    const created = new this.editorialModel({ ...createEditorialDto, createdBy: userId });
    return created.save();
  }

  async findAll(query: EditorialPaginationQuery) {
    const options = query.getPaginationOptions();
    return this.editorialModel.find(query.filter, options.select).populate(options.populate).exec();
  }

  async findOne(id: string) {
    return this.editorialModel.findById(id).exec();
  }

  async update(id: string, updateEditorialDto: UpdateEditorialDto, userId: string) {
    return this.editorialModel.findByIdAndUpdate(
      id,
      { ...updateEditorialDto, updatedBy: userId },
      { new: true },
    ).exec();
  }

  async remove(id: string) {
    return this.editorialModel.findByIdAndDelete(id).exec();
  }
}
