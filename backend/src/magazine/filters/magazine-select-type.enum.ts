export enum MagazineSelectTypeEnum {
  DEFAULT = 'default',
  LIST = 'list',
  DROPDOWN = 'dropdown',
}

export const MagazineSelectType = {};
MagazineSelectType[MagazineSelectTypeEnum.DEFAULT] = {
  select: '',
  populate: '',
};
MagazineSelectType[MagazineSelectTypeEnum.LIST] = {
  select: 'title issueNumber editor status createdAt updatedAt',
  populate: '',
};
MagazineSelectType[MagazineSelectTypeEnum.DROPDOWN] = {
  select: 'title _id',
  populate: '',
  pagination: false,
};
