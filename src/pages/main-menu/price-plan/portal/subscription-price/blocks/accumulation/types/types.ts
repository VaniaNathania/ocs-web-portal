interface AccumulationVersion {
  accumulation: number;
  mappingId: number | null;
  priceId: number | null;
  resourceId: number;
  resourceName: string;
  reAttrName: string;
  offerVerId: null;
  shareFlag: string;
  comments: string;
  effDate: string | null;
  expDate: string | null;
  srcPriceId: number | null;
  ratePlanType: string;
  acmName: string | null;
  priceVerId: number;
  ratePlanId: number;
  rum: number;
  reAttr: number;
  refValueId: number;
}

interface VersionDateAcm {
  effDate: string;
  expDate: string;
  // date: string;
  // price: PriceAccumulation[];
}

interface VersionAccumulationList {
  priceVerId: number;
  effDate: string;
  expDate: string;
  date: string;
  price: PriceAccumulation[];
}

interface PriceAccumulation {
  priceId: number;
  accumulationType: string;
  calculateUnit: string;
}

interface CreateVersionAccumulation {
  offerVerId: number;
  ratePlanId: number;
  priceVerId: number;
  effDate: string;
  expDate: string;
  resourceId: number;
  reAttrId: number;
  calculateUnit: number;
  accumulation: string;
  remarks: string;
  timeSpanAccumulation?: TimeSpanAccumulation[] | null;
  referenceAccumulation?: ReferenceAccumulation[] | null;
  expressionPrice?: ExpressionPriceSubscription | null;
}

interface TimeSpanAccumulation {
  timeSpanId: number;
  calculationMethod: string;
  valueString: string;
  calculationUnit: number;
}

interface TimeSpanList {
  Id: number;
  timeSpanName: string;
}

interface ReferenceAccumulation {
  acmTimeSpanId: number | null;
  effValue: number;
  expValue: number;
  resourceId: number;
  calculationMethod: string;
  accumulation: string;
  calculateUnit: number;
}

interface ExpressionPriceSubscription {
  scriptTempletId: number;
  jsonScriptPage: string;
  ruleScript: string;
  ruleComment: string;
}
