interface RecurringPriceAcmDetail {
  priceVerId: number;
  accumulation: string | null;
  rum: number;
  resourceId: number;
  resourceName: string;
  reAttr: number;
  reAttrName: string;
  effDate: string;
  expDate: string | null;
  acmName: string | null;
  priceId: number;
  srcPriceId: number | null;
  comments: string | null;
  refValueId: number;
  shareFlag: string | null;
  ratePlanId: number;
  ratePlanType: string;
  offerVerId: number;
  mappingId: number | null;
}

interface RecurringCreateAcm {
  offerVerId: number;
  ratePlanId: number;
  priceVerId: number;
  mappingId: number | null;
  effDate: string;
  expDate: string | null;
  resourceId: number | null;
  reAttrId: number | null;
  calculateUnit: number | null;
  accumulation: string | null;
  remarks: string | null;
  templateId: number | null;
  expressionPrice: ExpressionPriceAcm | null;
}

interface RecurringUpdateAcm {
  offerVerId: number;
  ratePlanId: number;
  priceVerId: number;
  mappingId: number | null;
  effDate: string;
  expDate: string | null;
  resourceId: number | null;
  reAttrId: number | null;
  calculateUnit: number | null;
  accumulation: string | null;
  remarks: string | null;
  templateId: number | null;
  timeSpanAccumulation: null;
  referenceAccumulation: null;
  expressionPrice: ExpressionPriceAcm | null;
}

interface ExpressionPriceAcm {
  scriptTempletId: number | null;
  jsonScriptPage: string | null;
  ruleScript: string | null;
  ruleComment: string | null;
}
