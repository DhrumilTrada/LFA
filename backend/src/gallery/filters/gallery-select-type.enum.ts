export enum GallerySelectTypeEnum {
  DEFAULT = 'default',
  LIST = 'list',
  DROPDOWN = 'dropdown',
}

export const GallerySelectType = {};
GallerySelectType[GallerySelectTypeEnum.DEFAULT] = {
  select: '',
  populate: '',
};
GallerySelectType[GallerySelectTypeEnum.LIST] = {
  select: 'image title category year createdAt updatedAt',
  populate: '',
};
GallerySelectType[GallerySelectTypeEnum.DROPDOWN] = {
  select: 'title _id',
  populate: '',
  pagination: false,
};
