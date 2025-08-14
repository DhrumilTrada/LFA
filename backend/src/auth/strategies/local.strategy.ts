import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from '../auth.service'

/**
 * Local Strategy to verify email and passwords
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super()
  }

  async validate(email: string, password: string): Promise<any> {
    console.log(
      'Entry:local strategy Validate function params : email ' +
        JSON.stringify(email) +
        ' password ' +
        JSON.stringify(password)
    )

    // Validate the request
    if (!(email != undefined && email !== null && email != '')) {
      throw new UnauthorizedException(['Email should not be empty'])
    }

    if (!(password != undefined && password !== null && password != '')) {
      throw new UnauthorizedException(['Password should not be empty'])
    }

    // check if user exists with valid credentials
    const user = await this.authService.validateUser(email, password)
    if (!user) {
      throw new UnauthorizedException(['Invalid email / password combination'])
    }

    return user
  }
}
