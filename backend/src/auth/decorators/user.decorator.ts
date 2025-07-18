import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const UserId = createParamDecorator(
  (data: string, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest().user.id
)

export const UserRole = createParamDecorator(
  (data: string, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest().user.role
)