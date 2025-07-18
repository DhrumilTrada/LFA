import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'
import { AuthService } from '../auth.service'

/**
 * Local Strategy to verify username and passwords
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super()
  }

  async validate(username: string, password: string): Promise<any> {
    console.log(
      'Entry:local strategy Validate function params : username ' +
        JSON.stringify(username) +
        ' password ' +
        JSON.stringify(password)
    )

    // Validate the request
    if (!(username != undefined && username !== null && username != '')) {
      throw new UnauthorizedException(['Email should not be empty'])
    }

    if (!(password != undefined && password !== null && password != '')) {
      throw new UnauthorizedException(['Password should not be empty'])
    }

    // check if user exists with valid credentials
    const user = await this.authService.validateUser(username, password)
    if (!user) {
      throw new UnauthorizedException(['Invalid email / password combination'])
    }

    return user
  }
}
