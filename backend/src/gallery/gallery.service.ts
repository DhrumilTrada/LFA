import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gallery, GalleryDocument } from './schemas/gallery.schema';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { GalleryPaginationQuery } from './filters/gallery.filter';

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(
    @InjectModel(Gallery.name) public galleryModel: Model<GalleryDocument>,
  ) {}

  async create(createGalleryDto: CreateGalleryDto, userId: string) {
    const created = new this.galleryModel({ ...createGalleryDto, createdBy: userId });
    return created.save();
  }

  async findAll(query: GalleryPaginationQuery) {
    const options = query.getPaginationOptions();
    return this.galleryModel.find(query.filter, options.select).populate(options.populate).exec();
  }

  async findOne(id: string) {
    return this.galleryModel.findById(id).exec();
  }

  async update(id: string, updateGalleryDto: UpdateGalleryDto, userId: string) {
    return this.galleryModel.findByIdAndUpdate(
      id,
      { ...updateGalleryDto, updatedBy: userId },
      { new: true },
    ).exec();
  }

  async remove(id: string) {
    return this.galleryModel.findByIdAndDelete(id).exec();
  }
}
