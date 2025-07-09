import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { FormService } from './form.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '../helpers/response-mapping/response.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Form')
@Controller('forms')
export class FormController {
  private readonly logger = new Logger(FormController.name);

  constructor(private readonly formService: FormService) {}

  @ApiOperation({ summary: 'Creates a form (dynamic schema)' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ResponseMessage('Form created successfully')
  @Post()
  create(
    @Body() createFormDto: CreateFormDto,
    // @UserId() userId: string // Uncomment if you have user context
  ) {
    this.logger.log('inside create form controller');
    return this.formService.create(createFormDto, null); // Replace null with userId if available
  }

  @ApiOperation({ summary: 'Get a list of forms' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get()
  findAll() {
    return this.formService.findAll();
  }

  @ApiOperation({ summary: 'Get a form by id' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.formService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a form (dynamic schema)' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFormDto: UpdateFormDto,
    // @UserId() userId: string // Uncomment if you have user context
  ) {
    return this.formService.update(id, updateFormDto, null); // Replace null with userId if available
  }

  @ApiOperation({ summary: 'Delete a form' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.formService.remove(id);
  }
}
