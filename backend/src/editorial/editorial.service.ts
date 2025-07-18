import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Editorial, EditorialDocument } from './schemas/editorial.schema';
import { CreateEditorialDto } from './dto/create-editorial.dto';
import { UpdateEditorialDto } from './dto/update-editorial.dto';
import { EditorialPaginationQuery } from './filters/editorial.filter';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class EditorialService {
  private readonly logger = new Logger(EditorialService.name);

  constructor(
    @InjectModel(Editorial.name) public editorialModel: Model<EditorialDocument>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createEditorialDto: CreateEditorialDto, userId: string) {
    // If image field is present and is a buffer, upload to Cloudinary
    let imageUrl = (createEditorialDto as any).image;
    let size = 0;
    if ((createEditorialDto as any).image && Buffer.isBuffer((createEditorialDto as any).image)) {
      const result = await this.cloudinaryService.uploadFile((createEditorialDto as any).image, 'editorial-image', 'image/jpeg');
      imageUrl = result.url;
      size = result.size;
    }
    const created = new this.editorialModel({ ...createEditorialDto, image: imageUrl, size, createdBy: userId });
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
    let imageUrl = (updateEditorialDto as any).image;
    let size = 0;
    if ((updateEditorialDto as any).image && Buffer.isBuffer((updateEditorialDto as any).image)) {
      const result = await this.cloudinaryService.uploadFile((updateEditorialDto as any).image, 'editorial-image', 'image/jpeg');
      imageUrl = result.url;
      size = result.size;
    }
    return this.editorialModel.findByIdAndUpdate(
      id,
      { ...updateEditorialDto, image: imageUrl, size, updatedBy: userId },
      { new: true },
    ).exec();
  }

  async remove(id: string) {
    return this.editorialModel.findByIdAndDelete(id).exec();
  }
}
