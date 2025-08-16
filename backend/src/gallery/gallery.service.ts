import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gallery, GalleryDocument } from './schemas/gallery.schema';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { GalleryPaginationQuery } from './filters/gallery.filter';
import { FileService } from '../file/file.service';

@Injectable()
export class GalleryService {
  private readonly logger = new Logger(GalleryService.name);

  constructor(
    @InjectModel(Gallery.name) public galleryModel: Model<GalleryDocument>,
    private readonly fileService: FileService,
  ) {}

  async create(createGalleryDto: CreateGalleryDto, userId: string) {
    let imageUrl = createGalleryDto.image;
    let size = 0;
    if (createGalleryDto.image && Buffer.isBuffer(createGalleryDto.image)) {
      const result = await this.fileService.saveFile(createGalleryDto.image, 'gallery-image.jpg', 'gallery', 'image/jpeg');
      imageUrl = result.url;
      size = result.size;
    }
    const created = new this.galleryModel({ ...createGalleryDto, image: imageUrl, size, createdBy: userId, createdAt: new Date() });
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
    const image = await this.galleryModel.findById(id).exec();
    let size = 0;
    if (updateGalleryDto.image && Buffer.isBuffer(updateGalleryDto.image)) {
      const result = await this.fileService.saveFile(updateGalleryDto.image, 'gallery-image.jpg', 'gallery', 'image/jpeg');
      const previousImageLocation = image.image;
      imageUrl = result.url;
      await this.fileService.deleteFile(previousImageLocation);
      size -= (await this.fileService.getFileSize(previousImageLocation, 'gallery', 'image/jpeg')) || 0;
      size += result.size;
    }
    return this.galleryModel.findByIdAndUpdate(
      id,
      { ...updateGalleryDto, image: imageUrl, size, updatedBy: userId },
      { new: true },
    ).exec();
  }

  async remove(id: string) {
    const gallery = await this.galleryModel.findByIdAndDelete(id).exec();
    await this.fileService.deleteFile(gallery.image);
    return gallery;
  }

  async getCategories() {
    const categories = await this.galleryModel.distinct('category').exec();
    return [
      { key: "Travel", value: "travel" },
      { key: "Nature", value: "nature" },
      { key: "Architecture", value: "architecture" },
      { key: "People", value: "people" },
      { key: "Animals", value: "animals" },
      { key: "Food", value: "food" },
      { key: "Sports", value: "sports" },
      { key: "Technology", value: "technology" },
      { key: "Art", value: "art" },
      { key: "Music", value: "music" },
    ];
  }
}
