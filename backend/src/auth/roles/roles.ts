export enum Role {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  USER = 'user'
}

export enum Permission {
  USERS_VIEW = 'users-view',
  USERS_ADD = 'users-add',
  USERS_EDIT = 'users-edit',
  USERS_DELETE = 'users-delete',
  OTHER = 'OTHER'
}

export const ROLE_PERMISSIONS = {}

ROLE_PERMISSIONS[Role.SUPER_ADMIN] = [
  Permission.USERS_VIEW,
  Permission.USERS_ADD,
  Permission.USERS_EDIT,
  Permission.USERS_DELETE
]

ROLE_PERMISSIONS[Role.ADMIN] = [
  Permission.USERS_VIEW,
  Permission.USERS_ADD,
  Permission.USERS_EDIT,
  Permission.USERS_DELETE
]

ROLE_PERMISSIONS[Role.USER] = [Permission.USERS_VIEW]
