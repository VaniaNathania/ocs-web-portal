interface SubscriptionBenefitVersion {
  priceVerId: number;
  effDate: string | null;
  expDate: string | null;
  date: string | null;
  price: PriceBenefit[];
}

interface PriceBenefit {
  priceId: number;
  priceName: string;
  priceVerId: number;
  reType: string;
  subBalTypeId: number;
  acctItemTypeName: string | null;
  acctResName: string | null;
  priority: number;
  calculateUnit: string;
  scriptPage: string | null;
  value: number;
  configType: string;
  reAttr: number;
  reAttrName: string | null;
  rum: number | null;
  calcPrecision: number;
  mappingId: number | null;
}

interface SubscriptionBenefitDetail {
  priceId: number;
  priceVerId: number;
  effectiveDate: string;
  expiryDate: string | null;
  effDate?: string | null;
  expDate?: string | null;
  benefitName: string;
  remarks: string | null;
  configType: string | null;
  benefitValue: number;
  acctBalanceTypeId: number;
  accountBalanceTypeName: number | null;
  calculationUnit: number | null;
  reAttr: number;
  reAttrName: string | null;
  cycleFloorLimit: number | null;
  cycleCeilLimit: number | null;
  dailyFloorLimit: number | null;
  dailyCeilLimit: number | null;
  maximumDays: number | null;
  subscriberOnly: string | null;
  absoluteEffectiveDate: string | null;
  absoluteExpiryDate: string | null;
  offsetOfEffectiveDate: number | null;
  offsetOfEffectiveDateUnit: string | null;
  offsetOfAbsoluteExpiry: number | null;
  durationOfAvailability: number | null;
  durationOfAvailabilityUnit: string | null;
  relativeEffectiveTime: string | null;
  relativeExpiryTime: string | null;
  relativePeriodUnit: string | null;
  balFlags: string | null;
  rule: string | null;
  ruleRemarks: string | null;
  scriptPage: string | null;
  scriptTempletId: number | null;
}

interface SubscriptionCreateBenefit extends SubscriptionBenefitDetail {
  ratePlanId: number;
  offerVerId: number;
  priceVerId: number;
  effectiveDate: string;
  expiryDate: string | null;
  advanceBenefit: AdvancedBenefit | null;
}

interface SubscriptionUpdateBenefit {
  benefitName: string;
  remarks: string | null;
  benefitValue: string;
  acctBalanceTypeId: number | null;
  reAttrId: number;
  calculationUnit: number | null;
  cycleFloorLimit: number | null;
  dailyFloorLimit: number | null;
  cycleCeilLimit: number | null;
  dailyCeilLimit: number | null;
  maximumDays: number | null;
  subscriberOnly: string | null;
  absoluteEffectiveDate: string | null;
  absoluteExpiryDate: string | null;
  offsetOfEffectiveDate: number | null;
  offsetOfEffectiveDateUnit: string | null;
  durationOfAvailability: number | null;
  durationOfAvailabilityUnit: string | null;
  relativeEffectiveTime: string | null;
  relativeExpiryTime: string | null;
  relativePeriodUnit: string | null;
  offsetOfAbsoluteExpiry: number | null;
  balFlags: string | null;
  advanceBenefit: AdvancedBenefit | null;
}

interface AdvancedBenefit {
  scriptTempletId: number | null;
  jsonScriptPage: string | null;
  ruleScript: string | null;
  advancedBenefitRemarks: string | null;
}
