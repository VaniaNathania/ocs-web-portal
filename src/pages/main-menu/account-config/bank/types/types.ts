interface BankList {
  bankId: number;
  parentId: number;
  bankName: string;
  comments: string | null;
  bankCode: string;
  state: string;
  stateDate: string;
  spId: number;
  directDebitFlag: string;
  bic: string;
  ibanFormat: string;
  child: number;
}

interface BankRow {
  bankId: number;
  parentId: number;
  bankName: string;
  comments: string | null;
  bankCode: string;
  state: string;
  stateDate: string;
  spId: number;
  directDebitFlag: string;
  bic: string;
  ibanFormat: string;
  child: number;
  subRows?: BankRow[];
}

interface BankAddPayload {
  parentId: number | null;
  bankName: string;
  comments: string | null;
  stateDate: string;
  bankCode: string;
  spId: number;
  countryCode: string;
  sepaAction: string;
  bic: string | null;
  directDebitFlag: string | null;
  ibanFormat: string | null;
}
