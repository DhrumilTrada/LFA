import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gallery, GalleryDocument } from './schemas/gallery.schema';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { GalleryPaginationQuery } from './filters/gallery.filter';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(
    @InjectModel(Gallery.name) public galleryModel: Model<GalleryDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createGalleryDto: CreateGalleryDto, userId: string) {
    let imageUrl = createGalleryDto.image;
    let size = 0;
    if (createGalleryDto.image && Buffer.isBuffer(createGalleryDto.image)) {
      const result = await this.cloudinaryService.uploadFile(createGalleryDto.image, 'gallery-image', 'image/jpeg');
      imageUrl = result.url;
      size = result.size;
    }
    const created = new this.galleryModel({ ...createGalleryDto, image: imageUrl, size, createdBy: userId });
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
    let imageUrl = updateGalleryDto.image;
    let size = 0;
    if (updateGalleryDto.image && Buffer.isBuffer(updateGalleryDto.image)) {
      const result = await this.cloudinaryService.uploadFile(updateGalleryDto.image, 'gallery-image', 'image/jpeg');
      imageUrl = result.url;
      size = result.size;
    }
    return this.galleryModel.findByIdAndUpdate(
      id,
      { ...updateGalleryDto, image: imageUrl, size, updatedBy: userId },
      { new: true },
    ).exec();
  }

  async remove(id: string) {
    return this.galleryModel.findByIdAndDelete(id).exec();
  }
}
