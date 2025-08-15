import {
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { PaginateModel } from 'mongoose'
import { CreateUserDto } from './dto/create-user.dto'
import { Token, User, UserDocument } from './schemas/user.schema'
import * as bcrypt from 'bcrypt'
import { UpdateUserDto } from './dto/update-user.dto'
import { AuthService } from '../auth/auth.service'
import { UserPaginationQuery, UserSelectTypeQuery } from './filters/user.filter'
import { Role } from '../auth/roles/roles'
import { WrapperType } from '../helpers/wrapper-type.decorator'
import { ResetPasswordRequestDto } from '../auth/dto/reset-password-request.dto'
import { UserResponseMessages } from 'src/config/constants/CustomResponses'
import { CacheService } from 'src/cache/cache.service'

@Injectable()
export class UsersApiService {
  private readonly logger = new Logger(UsersApiService.name)

  constructor(
    @InjectModel(User.name) public userModel: any,
    @Inject(forwardRef(() => AuthService))
    private authService: WrapperType<AuthService>,
    private readonly cacheService: CacheService
  ) {}

  /**
   * Create new user by adding reset password token
   */
  async create(createUserDto: CreateUserDto, userData, userRole) {
    // Check if email already exisits in the system
    if (await this.findByEmail(createUserDto.email)) {
      throw new HttpException(
        UserResponseMessages.EMAIL_ALREADY_IN_USE,
        HttpStatus.BAD_REQUEST
      )
    }

    // set a reset password token to the new user for setting a password
    createUserDto['resetPasswordToken'] =
      this.authService.createResetPasswordToken(createUserDto)
    createUserDto['password'] = null
    
    const loginUserRole = userRole
    createUserDto.email = createUserDto.email.toLowerCase()
    const user = new this.userModel(createUserDto)

    // Not add any method in Super Admin
    if (loginUserRole === Role.ADMIN || loginUserRole === Role.SUPER_ADMIN) {
      if (
        user.role === Role.SUPER_ADMIN &&
        ![Role.ADMIN, Role.USER].includes(user.role)
      )
        throw new HttpException(
          UserResponseMessages.CANNOT_ADD_SUPER_ADMIN,
          HttpStatus.BAD_REQUEST
        )
    } else {
      throw new HttpException(
        UserResponseMessages.PERMISSION_NOT_GRANTED,
        HttpStatus.BAD_REQUEST
      )
    }

    // No Errors
    await user.save()

    const resetPasswordRequestDto = new ResetPasswordRequestDto()
    resetPasswordRequestDto.email = user.email
    // await this.authService.resetPasswordRequest(resetPasswordRequestDto)

    const newUser = await this.userModel
      .findOne({ _id: user._id })
      .select('+resetPasswordToken')
      .exec()
    this.logger.log(`New user details: ${newUser}`)

    await this.cacheService.clearKeysByPrefix('user')

    return newUser
  }

  /**
   * Creates the user object with role
   * @param createUserDto user request object
   */
  async createFirstUser(createUserDto: CreateUserDto) {
    // get total users
    const totalCount = await this.userModel.countDocuments()

    if (totalCount == 0) {
      // Update the password with bcrypt
      // const saltOrRounds = 10
      // createUserDto.password = await bcrypt.hash(
      //   createUserDto.password,
      //   saltOrRounds
      // )

      createUserDto['resetPasswordToken'] =
        this.authService.createResetPasswordToken(createUserDto)
      createUserDto['password'] = null

      // Convert to the user document
      createUserDto.email = createUserDto.email.toLowerCase()
      const user = new this.userModel(createUserDto)

      if (user.role === Role.SUPER_ADMIN) {
        // No Errors
        await user.save()
        const newUser = await this.userModel
          .findOne({ _id: user._id })
          .select('+resetPasswordToken')
          .exec()
        this.logger.log(`New user details: + ${newUser}`)

        await this.cacheService.clearKeysByPrefix('user')

        return newUser
        // return user
      } else {
        throw new HttpException(
          UserResponseMessages.FIRST_USER_MUST_BE_SUPER_ADMIN,
          HttpStatus.BAD_REQUEST
        )
      }
    } else {
      this.logger.error(
        'At least 1 user already exists in the system. Please use those credentials to log in.'
      )
      throw new HttpException(
        UserResponseMessages.AT_LEAST_ONE_USER_EXISTS,
        HttpStatus.BAD_REQUEST
      )
    }
  }

  /**
   * Get all the users with pagination query
   * @param params
   * @returns Users
   */
  async findAll(params: UserPaginationQuery, userRole) {

    const filters = this.getFilterParams(params.filter, userRole)
    const user = await this.userModel.paginate(
      filters,
      params.getPaginationOptions()
    )
    return user
  }

  async findAllByAggregation(params: UserPaginationQuery, userRole) {
    const filters = this.getFilterParams(params.filter, userRole)
    const sortConfig = this.getSortConfig(params.sort)
    const aggregate = this.userModel.aggregate([
      { $match: filters },
      {
        $project: {
          name: 1,
          email: 1,
          customerAddressCoordinates: 1,
          phno: 1,
          role: 1,
          isActive: 1
        }
      },
      { $sort: sortConfig }
    ])

    const options = {
      page: params.page || 1,
      limit: params.limit || 50,
      pagination: params.pagination,
      customLabels: {
        docs: 'items',
        totalDocs: 'total'
      }
    }

    const userAggregatePaginate = await this.userModel.aggregatePaginate(
      aggregate,
      options
    )

    return userAggregatePaginate
  }

  private getSortConfig(sort: any) {
    if (!sort) return { createdAt: -1 }

    const sortField = Object.keys(sort)[0]
    const sortValue: number = Number(sort[sortField])
    const sortMapping: { [key: string]: string } = {
      'updatedBy.name': 'updatedBy.name'
    }

    const mappedField = sortMapping[sortField] || sortField
    return { [mappedField]: sortValue }
  }

  private getFilterParams(filterParams, userRole) {
    const filter = {}

    if (userRole === 'admin') {
      filter['role'] = { $in: ['admin', 'user'] }
    } else if (userRole === 'user') {
      filter['role'] = 'user'
    }

    return filter
  }

  async findOne(id: string, params: UserSelectTypeQuery) {
    const cacheKey = `user:${id}:${JSON.stringify(params)}`
    const cachedData = await this.cacheService.get(cacheKey)
    if (cachedData) {
      return cachedData
    }
    const user = await this.userModel
      .findById(id, null, params.getOptions())
      .exec()
    await this.cacheService.set(cacheKey, user)
    return user
  }

  async findByEmail(email: string, isActive = true): Promise<User> {
    console.log(
      'Entry:find by email function in user service params : email ' +
        JSON.stringify(email)
    )
    const result = await this.userModel
      .findOne({ email: email.toLowerCase(), isActive: isActive })
      .exec()

    return result
  }

  async update(id: string, updateUserDto: UpdateUserDto, userData, userRole) {
    console.log("User data in update function: ", userData)
    if (updateUserDto.password) {
      const saltOrRounds = 10
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltOrRounds
      )
    }

    const oldUser = await this.userModel.findOne({ _id: id }).exec()

    const loginUserRole = userRole

    if (loginUserRole === Role.ADMIN || loginUserRole === Role.SUPER_ADMIN) {
      if (
        updateUserDto.role === Role.SUPER_ADMIN &&
        ![Role.ADMIN, Role.USER].includes(updateUserDto.role)
      )
        throw new HttpException(
          UserResponseMessages.CANNOT_EDIT_SUPER_ADMIN,
          HttpStatus.BAD_REQUEST
        )
    } else {
      throw new HttpException(
        UserResponseMessages.USER_CANNOT_EDIT,
        HttpStatus.BAD_REQUEST
      )
    }
    const updatedData = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec()

    await this.cacheService.clearKeysByPrefix('user')

    return updatedData
  }

  async remove(id: string, userData) {
    await this.cacheService.clearKeysByPrefix('user')
    return await this.userModel.deleteOne({ _id: id }).exec()
  }
}
