export interface BankListFetchResponse {
  code: string;
  desc: string;
  data: BankInfoModel[];
}

export interface BankInfoModel {
  id: number;
  name: string;
  code: string;
  bin: string;
  shortName: string;
  logo: string;
  transferSupported: number;
  lookupSupported: number;
  short_name: string;
  support: number;
  isTransfer: number;
  swift_code: string;
}
