export interface AcctModHisList {
  newValue: string;
  updateDate: string;
  updateFlag: string;
  newInputType: string;
  attrValueMark: string;
  partyCodeName: string;
  attrId: number;
  partyCode: string;
  property: string;
  inputType: string;
  oldValue: string;
  attrName: string;
  oldInputType: string;
}

export interface ModHisQuery {
  attrName?: string;
  start?: string;
  end?: string;
}
