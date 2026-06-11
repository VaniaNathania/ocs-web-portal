interface Events {
  reId: number;
  offerVerId: number;
  reName: string;
}

interface RatePlans {
  ratePlanId: number;
  ratePlanName: string;
  ratePlanType: string;
  ratePlanMapping: string;
  priceVerId: number;
  reId: number;
}

interface ReAttrProps {
  id: string;
  reAttrName: string;
}

interface AcctTypeNameProps {
  id: string;
  acctItemTypeName: string;
}

interface PriceVersion {
  priceVerId: number;
  effDate: string | null;
  expDate: string | null;
  price: Price[];
  date: string | null;
}

interface ValidateVersionType  {
   effDate?: string;
    expDate?: string 
  }

interface Benefit {
  priceId: number;
  priceName: string;
  priceVerId: number;
  subBalTypeId: number;
  priority: number;
  scriptPage: string | null;
  value: number;
  configType: string | null;
  reAttr: number | null;
  reAttrName: string;
  rum: number;
  calcPrecision: number;
  ruleScript: string | null;
  ruleComments: string | null;
  scriptTempletId: number | null;
  repeatCnt: number | null;
  periodId: number;
  acctResId: number;
  isCurrency: string;
  acctResName: string;
  offsetOfEffectiveDateUnit: string | null;
  durationOfAvailabilityUnit: string | null;
  relEffUnitName: string | null;
  relExpUnitName: string | null;
  effectiveDate: string;
  expiryDate: string;
  shareFlag: string;
  ratePlanId: number;
  ratePlanType: number;
  offerVerId: number;
  mappingId: number;
}

interface Price {
  acctItemTypeId: number;
  acctItemTypeIdParam: number;
  acctItemTypeName: string | null;
  acctResName: string;
  calcDisAitId: number | null;
  calcPrecision: string | null;
  comments: string | null;
  creditLimit: number | null;
  depositTypeId: number | null;
  depositTypeName: string | null;
  effDate: string;
  expDate: string | null;
  isCurrency: string;
  mappingId: number | null;
  offerVerId: number | null;
  param: string | null;
  parentPriceId: number | null;
  payIndicator: string;
  priceAcctItemTypeId: number | null;
  priceId: number;
  priceName: string;
  priceVerId: number;
  priority: number;
  ratePlanId: number;
  ratePlanType: string;
  ratePrecision: string;
  reAttr: number;
  reAttrName: string;
  rum: number;
  shareFlag: string;
  value: number;
  valueString: "0";
}

