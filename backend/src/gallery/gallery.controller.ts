import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Logger,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../helpers/response-mapping/response.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GalleryPaginationQuery } from './filters/gallery.filter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UserId } from 'src/auth/decorators/user.decorator';
import { File as MulterFile } from 'multer';

@ApiTags('Gallery')
@Controller('galleries')
export class GalleryController {
  private readonly logger = new Logger(GalleryController.name);

  constructor(private readonly galleryService: GalleryService) {}

  @ApiOperation({ summary: 'Creates a gallery item' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ResponseMessage('Gallery item created successfully')
  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async create(
    @UploadedFiles() files: { image?: MulterFile[] },
    @Body() createGalleryDto: CreateGalleryDto,
    @UserId() userId: string,
  ) {
    if (files.image?.[0]) {
      createGalleryDto.image = files.image[0].buffer;
    }
    return this.galleryService.create(createGalleryDto, userId);
  }

  @ApiOperation({ summary: 'Get a list of gallery items' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get()
  findAll(@Query() query: GalleryPaginationQuery) {
    return this.galleryService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a gallery item by id' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.galleryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  update(
    @Param('id') id: string,
    @UploadedFiles() files: { image?: MulterFile[] },
    @Body() updateGalleryDto: UpdateGalleryDto,
    @UserId() userId: string
  ) {
    if (files.image?.[0]) {
      updateGalleryDto.image = files.image[0].buffer;
    }
    return this.galleryService.update(id, updateGalleryDto, userId);
  }

  @ApiOperation({ summary: 'Delete a gallery item' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.galleryService.remove(id);
  }

  @ApiOperation({ summary: 'Get all available categories' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('categories/list')
  getCategories() {
    return this.galleryService.getCategories();
  }
}
