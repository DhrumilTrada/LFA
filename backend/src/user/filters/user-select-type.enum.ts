//create a select type enum
export enum SelectType {
  DEFAULT = 'default',
  LIST = 'list',
  DROPDOWN = "dropdown"
}

export const UserSelectType = {}
// you can add any query params fields in object
UserSelectType[SelectType.DEFAULT] = {
  select: '',
  populate: ''
}

UserSelectType[SelectType.LIST] = {
  select: 'name email createdAt updatedAt',
  populate: ''
}

UserSelectType[SelectType.DROPDOWN] = {
  select: 'name _id',
  populate: '',
  pagination: false
}
