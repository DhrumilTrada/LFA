import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Magazine, MagazineDocument } from './schemas/magazine.schema';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { UpdateMagazineDto } from './dto/update-magazine.dto';
import { MagazinePaginationQuery } from './filters/magazine.filter';
import { FileService } from '../file/file.service';

@Injectable()
export class MagazineService {
  private readonly logger = new Logger(MagazineService.name);

  constructor(
    @InjectModel(Magazine.name) public magazineModel: Model<MagazineDocument>,
    private readonly fileService: FileService,
  ) {}

  async create(createMagazineDto: CreateMagazineDto, userId: string) {
    let imageUrl = createMagazineDto.image;
    let pdfUrl = createMagazineDto.pdf;
    let size = 0;
    // If image is a buffer, save to local uploads folder
    if (createMagazineDto.image && Buffer.isBuffer(createMagazineDto.image)) {
      const result = await this.fileService.saveFile(createMagazineDto.image, 'magazine-image.jpg', 'magazines', 'image/jpeg');
      imageUrl = result.url;
      size += result.size;
    }
    // If pdf is a buffer, save to local uploads folder
    if (createMagazineDto.pdf && Buffer.isBuffer(createMagazineDto.pdf)) {
      const result = await this.fileService.saveFile(createMagazineDto.pdf, 'magazine.pdf', 'magazines', 'application/pdf');
      pdfUrl = result.url;
      size += result.size;

      console.log(pdfUrl, "Pdf saved to url");
    }
    const created = new this.magazineModel({ ...createMagazineDto, image: imageUrl, pdf: pdfUrl, size, createdBy: userId });
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
    let imageUrl = updateMagazineDto.image;
    let pdfUrl = updateMagazineDto.pdf;
    let size = 0;
    if (updateMagazineDto.image && Buffer.isBuffer(updateMagazineDto.image)) {
      const result = await this.fileService.saveFile(updateMagazineDto.image, 'magazine-image.jpg', 'magazines', 'image/jpeg');
      imageUrl = result.url;
      size += result.size;
    }
    if (updateMagazineDto.pdf && Buffer.isBuffer(updateMagazineDto.pdf)) {
      const result = await this.fileService.saveFile(updateMagazineDto.pdf, 'magazine.pdf', 'magazines', 'application/pdf');
      pdfUrl = result.url;
      size += result.size;
    }
    return this.magazineModel.findByIdAndUpdate(
      id,
      { ...updateMagazineDto, image: imageUrl, pdf: pdfUrl, size, updatedBy: userId },
      { new: true },
    ).exec();
  }

  async remove(id: string) {
    return this.magazineModel.findByIdAndDelete(id).exec();
  }
}
