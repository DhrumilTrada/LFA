import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class RefreshTokenValidateAuthGuard extends AuthGuard(
  'jwt-refresh-validate-token'
) {}
