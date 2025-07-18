export enum EditorialSelectTypeEnum {
  DEFAULT = 'default',
  LIST = 'list',
  DROPDOWN = 'dropdown',
}

export const EditorialSelectType = {};
EditorialSelectType[EditorialSelectTypeEnum.DEFAULT] = {
  select: '',
  populate: '',
};
EditorialSelectType[EditorialSelectTypeEnum.LIST] = {
  select: 'title author category status createdAt updatedAt',
  populate: '',
};
EditorialSelectType[EditorialSelectTypeEnum.DROPDOWN] = {
  select: 'title _id',
  populate: '',
  pagination: false,
};
