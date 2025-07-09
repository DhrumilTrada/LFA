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
  Inject
} from '@nestjs/common'
import { UsersApiService } from './user-api.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ResponseMessage } from '../helpers/response-mapping/response.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PermissionGuard } from '../auth/roles/role-permissions.guard'
import { RequirePermissions } from '../auth/roles/role-permissions.decorator'
import { Permission } from '../auth/roles/roles'
import { UserId, UserRole } from '../auth/decorators/user.decorator'
import { UserPaginationQuery, UserSelectTypeQuery } from './filters/user.filter'
import { UserResponseMessages } from 'src/config/constants/CustomResponses'

@ApiTags('User')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(private readonly usersApiService: UsersApiService) {}

  @ApiOperation({ summary: 'Creates a user' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @ApiBearerAuth('access-token')
  @ResponseMessage(UserResponseMessages.USER_CREATED)
  @Post()
  create(
    @Body() createUserDto: CreateUserDto,
    @UserId() userData: string,
    @UserRole() userRole: string
  ) {
    this.logger.log('inside create controller')
    return this.usersApiService.create(createUserDto, userData, userRole)
  }

  @ApiOperation({ summary: 'Creates a first user when no other user exists' })
  @ResponseMessage(UserResponseMessages.FIRST_ADMIN_CREATED)
  @RequirePermissions(Permission.USERS_ADD)
  @Post('admin-user')
  createFirstUser(@Body() createUserDto: CreateUserDto) {
    this.logger.log('The very first user is about to be created!')
    return this.usersApiService.createFirstUser(createUserDto)
  }

  @ApiOperation({ summary: 'Get a list of users' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @ApiBearerAuth('access-token')
  @ResponseMessage(UserResponseMessages.USERS_FETCHED)
  @RequirePermissions(Permission.USERS_VIEW)
  @Get()
  findAll(@Query() params: UserPaginationQuery, @UserRole() userRole: string) {
    return this.usersApiService.findAll(params, userRole)
  }

  @ApiOperation({ summary: 'Get user details' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @ApiBearerAuth('access-token')
  @ResponseMessage(UserResponseMessages.USER_FETCHED)
  @RequirePermissions(Permission.USERS_VIEW)
  @Get(':id')
  findOne(@Param('id') id: string, @Query() params: UserSelectTypeQuery) {
    return this.usersApiService.findOne(id, params)
  }

  @ApiOperation({ summary: 'Update user details' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @ResponseMessage(UserResponseMessages.USER_UPDATED)
  @RequirePermissions(Permission.USERS_EDIT)
  @ApiBearerAuth('access-token')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UserId() userData: string,
    @UserRole() userRole: string
  ) {
    return this.usersApiService.update(id, updateUserDto, userData, userRole)
  }

  @ApiOperation({ summary: 'Deletes a user' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @ResponseMessage(UserResponseMessages.USER_DELETED)
  @RequirePermissions(Permission.USERS_DELETE)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  remove(@Param('id') id: string, @UserId() userData: string) {
    return this.usersApiService.remove(id, userData)
  }
}
