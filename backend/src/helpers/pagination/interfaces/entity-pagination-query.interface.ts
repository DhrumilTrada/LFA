//create entity pagination query interface which defines all pagination and filter params
export interface EntityPaginationQueryInterface {
  page: number
  limit: number
  sort: Record<string, number>
  pagination: boolean
  filter: Record<string, any>
}
