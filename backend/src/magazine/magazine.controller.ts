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
} from '@nestjs/common';
import { MagazineService } from './magazine.service';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { UpdateMagazineDto } from './dto/update-magazine.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../helpers/response-mapping/response.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MagazinePaginationQuery, MagazineSelectTypeQuery } from './filters/magazine.filter';

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
  create(
    @Body() createMagazineDto: CreateMagazineDto,
    // @UserId() userId: string // Uncomment if you have user context
  ) {
    this.logger.log('inside create magazine controller');
    return this.magazineService.create(createMagazineDto, null); // Replace null with userId if available
  }

  @ApiOperation({ summary: 'Get a list of magazines' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
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
  update(
    @Param('id') id: string,
    @Body() updateMagazineDto: UpdateMagazineDto,
    // @UserId() userId: string // Uncomment if you have user context
  ) {
    return this.magazineService.update(id, updateMagazineDto, null); // Replace null with userId if available
  }

  @ApiOperation({ summary: 'Delete a magazine' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.magazineService.remove(id);
  }
}
