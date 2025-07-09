import { SetMetadata } from '@nestjs/common'
import { Permission } from './roles'

export const PERMISSION_KEY = 'permission'

export const RequirePermissions = (...permission: Permission[]) =>
  SetMetadata(PERMISSION_KEY, permission)
