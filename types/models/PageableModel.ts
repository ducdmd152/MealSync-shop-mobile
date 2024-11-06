export default interface PageableModel {
  pageIndex: number;
  pageSize: number;
  numberOfItems: 20;
  totalOfPages: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
