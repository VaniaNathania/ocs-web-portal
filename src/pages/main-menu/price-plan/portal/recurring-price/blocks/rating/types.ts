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
  rpPriceUnit: string | null;
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

interface CreateRecurringRating {
  priceVerId: number;
  offerVerId: number;
  ratePlanId: number;
  effDate: string;
  expDate: string;
  priceName: string;
  payIndicator: string;
  resultAccountItemType: number | null;
  remarks: string | null;
  roundMode: number;
  price: string;
  calculateUnit: number | null;
  creditLimit: number | null;
  rpPriceUnit: string | null;
  newConnection: string;
  termination: string;
  normal: string;
  inAdvance: string;
  expressionPrice: ExpressionPriceRecurring | null;
}

interface UpdateRecurringRating {
  priceName: string;
  payIndicator: string | null;
  resultAccountItemType: number | null;
  remarks: string | null;
  roundMode: number | null;
  price: string | null;
  calculateUnit: number | null;
  creditLimit: number | null;
  rpPriceUnit: string | null;
  newConnection: string | null;
  termination: string | null;
  normal: string | null;
  inAdvance: string | null;
  expressionPrice: ExpressionPriceRecurring | null;
}

interface ExpressionPriceRecurring {
  scriptTempletId: number;
  jsonScriptPage: string;
  ruleScript: string;
  advancedBenefitRemarks: string | null;
}
