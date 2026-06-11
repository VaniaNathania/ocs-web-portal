// interface RecurringBenefitDetail {
//   priceVerId: number;
//   effDate: string;
//   expDate: string | null;
//   date: string | null;
//   price: PriceBenefit[];
// }

interface PriceBenefit {
  reType: string;
  priceId: number;
  subBalTypeId: number;
  priceName: string;
  acctItemTypeName: string | null;
  calculateUnit: string;
}

interface RecurringBenefitDetail {
  priceId: number;
  priceVerId: number;
  mappingId: number | null;
  priority: number;
  effectiveDate: string;
  expiryDate: string | null;
  value: string;
  rum: number;
  subBalTypeId: number;
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
  acctResName: string;
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

interface RecurringCreateBenefit extends RecurringBenefitDetail {
  ratePlanId: number;
  offerVerId: number;
  priceVerId: number;
  effectiveDate: string;
  expiryDate: string | null;
  advanceBenefit: AdvancedBenefit | null;
}

interface RecurringUpdateBenefit {
  benefitName: string;
  remarks: string | null;
  benefitValue: number;
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
