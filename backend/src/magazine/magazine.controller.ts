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
  UploadedFile,
  UploadedFiles
} from '@nestjs/common';
import { MagazineService } from './magazine.service';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { UpdateMagazineDto } from './dto/update-magazine.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../helpers/response-mapping/response.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MagazinePaginationQuery } from './filters/magazine.filter';
import { UserId } from 'src/auth/decorators/user.decorator';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { File as MulterFile } from 'multer';

@ApiTags('Magazine')
@Controller('magazines')
export class MagazineController {
  private readonly logger = new Logger(MagazineController.name);

  constructor(private readonly magazineService: MagazineService) {}

  @ApiOperation({ summary: 'Creates a magazine' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ResponseMessage('Magazine created successfully')
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }])
  )
  async create(
    @UploadedFiles() files: { image?: MulterFile[]; pdf?: MulterFile[]; },
    @Body() createMagazineDto: CreateMagazineDto,
    @UserId() userId: string,
  ) {
    if (files.image?.[0]) {
      createMagazineDto.image = files.image[0].buffer;
    }
    if (files.pdf?.[0]) {
      createMagazineDto.pdf = files.pdf[0].buffer;
    }
    return this.magazineService.create(createMagazineDto, userId);
  }

  @ApiOperation({ summary: 'Get a list of magazines' })
  // @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('access-token')
  @Get()
  findAll(@Query() query: MagazinePaginationQuery) {
    return this.magazineService.findAll(query);
  }

  @ApiOperation({ summary: 'Get a magazine by id' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.magazineService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a magazine' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }])
  )
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: { image?: MulterFile[]; pdf?: MulterFile[]; },
    @Body() updateMagazineDto: UpdateMagazineDto,
    @UserId() userId: string
  ) {
    if (files.image?.[0]) {
      updateMagazineDto.image = files.image[0].buffer;
    }
    if (files.pdf?.[0]) {
      updateMagazineDto.pdf = files.pdf[0].buffer;
    }
    return this.magazineService.update(id, updateMagazineDto, userId);
  }

  @ApiOperation({ summary: 'Delete a magazine' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.magazineService.remove(id);
  }
}
