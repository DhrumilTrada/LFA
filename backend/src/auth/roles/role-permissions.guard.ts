import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Permission, ROLE_PERMISSIONS } from './roles'
import { PERMISSION_KEY } from './role-permissions.decorator'

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()]
    )

    if (!requiredPermissions) {
      return true
    }

    const req = context.switchToHttp().getRequest()
    const user = req.user

    return requiredPermissions.every((permission) =>
      ROLE_PERMISSIONS[user.role].includes(permission)
    )
  }
}
