import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Editorial, EditorialDocument } from './schemas/editorial.schema';
import { CreateEditorialDto } from './dto/create-editorial.dto';
import { UpdateEditorialDto } from './dto/update-editorial.dto';
import { EditorialPaginationQuery } from './filters/editorial.filter';
import { FileService } from '../file/file.service';

@Injectable()
export class EditorialService {
  private readonly logger = new Logger(EditorialService.name);

  constructor(
    @InjectModel(Editorial.name) public editorialModel: Model<EditorialDocument>,
    private readonly fileService: FileService,
  ) {}

  async create(createEditorialDto: CreateEditorialDto, files: any, userId: string) {
    let imageUrl = null;
    let pdfUrl = null;
    let size = 0;

    // Handle image upload
    if (files?.image && files.image[0]) {
      const imageFile = files.image[0];
      const result = await this.fileService.saveFile(imageFile.buffer, imageFile.originalname, 'editorials', imageFile.mimetype);
      imageUrl = result.url;
      size += result.size;
    }

    // Handle PDF upload
    if (files?.pdf && files.pdf[0]) {
      const pdfFile = files.pdf[0];
      const result = await this.fileService.saveFile(pdfFile.buffer, pdfFile.originalname, 'editorials', pdfFile.mimetype);
      pdfUrl = result.url;
      size += result.size;
    }

    const created = new this.editorialModel({ 
      ...createEditorialDto, 
      image: imageUrl, 
      pdf: pdfUrl,
      size, 
      createdBy: userId 
    });
    return created.save();
  }

  async findAll(query: EditorialPaginationQuery) {
    const options = query.getPaginationOptions();
    return this.editorialModel.find(query.filter, options.select).populate(options.populate).exec();
  }

  async findOne(id: string) {
    return this.editorialModel.findById(id).exec();
  }

  async update(id: string, updateEditorialDto: UpdateEditorialDto, files: any, userId: string) {
    const editorial = await this.editorialModel.findById(id).exec();
    let imageUrl = editorial.image;
    let pdfUrl = editorial.pdf;
    let size = editorial.size || 0;

    // Handle image upload
    if (files?.image && files.image[0]) {
      const imageFile = files.image[0];
      const result = await this.fileService.saveFile(imageFile.buffer, imageFile.originalname, 'editorials', imageFile.mimetype);
      await this.fileService.deleteFile(editorial.image);
      imageUrl = result.url;
      size -= (await this.fileService.getFileSize(editorial.image, 'editorials', imageFile.mimetype)) || 0;
      size += result.size;
    }

    // Handle PDF upload
    if (files?.pdf && files.pdf[0]) {
      const pdfFile = files.pdf[0];
      const result = await this.fileService.saveFile(pdfFile.buffer, pdfFile.originalname, 'editorials', pdfFile.mimetype);
      await this.fileService.deleteFile(editorial.pdf);
      pdfUrl = result.url;
      size -= (await this.fileService.getFileSize(editorial.pdf, 'editorials', pdfFile.mimetype)) || 0;
      size += result.size;
    }

    const updateData: any = { ...updateEditorialDto, updatedBy: userId };
    if (imageUrl !== undefined) updateData.image = imageUrl;
    if (pdfUrl !== undefined) updateData.pdf = pdfUrl;
    if (size > 0) updateData.size = size;

    return this.editorialModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    ).exec();
  }

  async remove(id: string) {
    const editorial = await this.editorialModel.findByIdAndDelete(id).exec();
    await this.fileService.deleteFile(editorial.image);
    await this.fileService.deleteFile(editorial.pdf);
    return editorial;
  }
}
