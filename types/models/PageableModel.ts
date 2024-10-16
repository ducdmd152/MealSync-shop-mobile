export default interface PageableModel {
  pageNumber: number;
  pageSize: number;
  numberOfItems: 20;
  totalOfPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
