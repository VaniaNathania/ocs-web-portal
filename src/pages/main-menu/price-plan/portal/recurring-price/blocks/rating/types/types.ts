interface DetailRecurringRating {
  priceId: number;
  priceName: string;
  effDate: string;
  expDate: string | null;
  valueString: string;
  acctItemTypeId: number | null;
  acctItemTypeName: string | null;
  calculateUnit: number | null;
  comments: string | null;
  ratePrecision: string | null;
  calcPrecision: string | null;
  creditLimit: number | null;
  priority: number | null;
  payIndicator: string | null;
  scriptTempletId: number | null;
  ruleScript: string | null;
  ruleComments: string | null;
  param: string | null;
  scriptPage: string | null;
  configType: string | null;
  newConnection: string | null;
  termination: string | null;
  normal: string | null;
  inAdvance: string | null;
  priceByDay: string | null;
  priceByCycle: string | null;
  amount: string | null;
  roundMode: number | null;
}

interface ExpressionPriceRecurring {
  scriptTempletId: number;
  jsonScriptPage: string;
  ruleScript: string;
  advancedBenefitRemarks: string | null;
}
