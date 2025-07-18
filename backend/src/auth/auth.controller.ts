import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Headers,
  Patch,
  Post,
  Request,
  UseGuards
} from '@nestjs/common'
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { ResponseMessage } from '../helpers/response-mapping/response.decorator'
import { UpdateUserDto } from '../user/dto/update-user.dto'
import { User } from '../user/schemas/user.schema'
import { AuthService } from './auth.service'
import { UserId } from './decorators/user.decorator'
import { ResetPasswordRequestDto } from './dto/reset-password-request.dto'
import { ResetPasswordTokenDto } from './dto/reset-password.dto'
import { ValidateTokenDto } from './dto/validate-token.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { RefreshTokenAuthGuard } from './guards/refresh-token-auth.guard'
import { RefreshTokenValidateAuthGuard } from './guards/refresh-token-validate-auth.guard'
import { ROLE_PERMISSIONS } from './roles/roles'
import { Job } from 'bull'
import { UserLoginDto } from './dto/login.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { AuthResponseMessages } from 'src/config/constants/CustomResponses'
import { Throttle, ThrottlerGuard } from '@nestjs/throttler'

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'User Login' })
  @UseGuards(LocalAuthGuard, ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @Post('auth/login')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiBody({ type: UserLoginDto })
  @ResponseMessage(AuthResponseMessages.LOGIN_SUCCESS)
  async login(
    @Request() req,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string
  ) {
    return this.authService.login(req.user, ipAddress, userAgent)
  }

  @ApiOperation({ summary: 'Remove expired token' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('auth/removeExpiredToken')
  @ResponseMessage(AuthResponseMessages.EXPIRED_TOKENS_REMOVED)
  async removeExpireToken() {
    return this.authService.removeExpireToken()
  }

  @ApiOperation({ summary: 'User logout' })
  @UseGuards(RefreshTokenValidateAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('auth/logout')
  @ResponseMessage(AuthResponseMessages.LOGOUT_SUCCESS)
  async logout(@Request() req, @UserId() userId: string) {
    return this.authService.logout(req, userId)
  }

  @ApiOperation({ summary: 'User get new access Jwt Token' })
  @UseGuards(RefreshTokenAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('auth/refresh')
  @ApiBody({ type: RefreshTokenDto })
  @ResponseMessage(AuthResponseMessages.TOKEN_REFRESH_SUCCESS)
  async getNewAccessJwtToken(@Request() req, @UserId() userId: string) {
    return this.authService.getNewAccessJwtToken(req, userId)
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @UseGuards(RefreshTokenValidateAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('auth/user')
  getProfile(@UserId() userId: string) {
    return this.authService.getUserProfile(userId)
  }

  @ApiOperation({ summary: 'Update user profile' })
  @UseGuards(RefreshTokenValidateAuthGuard)
  @ResponseMessage(AuthResponseMessages.PROFILE_UPDATE_SUCCESS)
  @ApiBearerAuth('access-token')
  @Patch('profile')
  updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
    @UserId() userId: string
  ) {
    return this.authService.updateProfile(req.user.id, updateUserDto, userId)
  }

  @ApiOperation({
    summary:
      'Create reset password request by sending user the link to reset their password'
  })
  @Post('auth/reset-password-request')
  @ResponseMessage(AuthResponseMessages.RESET_PASSWORD_REQUEST_SUCCESS)
  async resetPasswordRequest(
    @Body() resetPasswordRequestDto: ResetPasswordRequestDto
  ) {
    return this.authService.resetPasswordRequest(resetPasswordRequestDto)
  }

  @ApiOperation({ summary: 'Resets the user password' })
  @Post('auth/reset-password')
  @ResponseMessage(AuthResponseMessages.RESET_PASSWORD_SUCCESS)
  async resetPassword(@Body() resetPasswordToken: ResetPasswordTokenDto) {
    return this.authService.resetPassword(resetPasswordToken)
  }

  @ApiOperation({ summary: 'Validates the forgot password token' })
  @Post('auth/validate-token')
  @ResponseMessage(AuthResponseMessages.VALIDATE_TOKEN_SUCCESS)
  async validateToken(@Body() validateTokenDto: ValidateTokenDto) {
    return this.authService.validateToken(validateTokenDto)
  }
}
