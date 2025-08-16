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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EditorialService } from './editorial.service';
import { CreateEditorialDto } from './dto/create-editorial.dto';
import { UpdateEditorialDto } from './dto/update-editorial.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../helpers/response-mapping/response.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EditorialPaginationQuery } from './filters/editorial.filter';
import { UserId } from 'src/auth/decorators/user.decorator';

@ApiTags('Editorial')
@Controller('editorials')
export class EditorialController {
  private readonly logger = new Logger(EditorialController.name);

  constructor(private readonly editorialService: EditorialService) {}

  @ApiOperation({ summary: 'Creates an editorial' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ResponseMessage('Editorial created successfully')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
  ]))
  @Post()
  create(
    @Body() createEditorialDto: CreateEditorialDto,
    @UploadedFiles() files: any,
    @UserId() userId: string
  ) {
    this.logger.log('inside create editorial controller');
    return this.editorialService.create(createEditorialDto, files, userId);
  }

  @ApiOperation({ summary: 'Get a list of editorials' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get()
  findAll(@Query() query: EditorialPaginationQuery) {
    return this.editorialService.findAll(query);
  }

  @ApiOperation({ summary: 'Get an editorial by id' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.editorialService.findOne(id);
  }

  @ApiOperation({ summary: 'Update an editorial' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
  ]))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEditorialDto: UpdateEditorialDto,
    @UploadedFiles() files: any,
    @UserId() userId: string
  ) {
    return this.editorialService.update(id, updateEditorialDto, files, userId);
  }

  @ApiOperation({ summary: 'Delete an editorial' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.editorialService.remove(id);
  }
}
