import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Magazine, MagazineDocument } from './schemas/magazine.schema';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { UpdateMagazineDto } from './dto/update-magazine.dto';
import { MagazinePaginationQuery } from './filters/magazine.filter';

@Injectable()
export class MagazineService {
  private readonly logger = new Logger(MagazineService.name);

  constructor(
    @InjectModel(Magazine.name) public magazineModel: Model<MagazineDocument>,
  ) {}

  async create(createMagazineDto: CreateMagazineDto, userId: string) {
    const created = new this.magazineModel({ ...createMagazineDto, createdBy: userId });
    return created.save();
  }

  async findAll(query: MagazinePaginationQuery) {
    const options = query.getPaginationOptions();
    return this.magazineModel.find(query.filter, options.select).populate(options.populate).exec();
  }

  async findOne(id: string) {
    return this.magazineModel.findById(id).exec();
  }

  async update(id: string, updateMagazineDto: UpdateMagazineDto, userId: string) {
    return this.magazineModel.findByIdAndUpdate(
      id,
      { ...updateMagazineDto, updatedBy: userId },
      { new: true },
    ).exec();
  }

  async remove(id: string) {
    return this.magazineModel.findByIdAndDelete(id).exec();
  }
}
