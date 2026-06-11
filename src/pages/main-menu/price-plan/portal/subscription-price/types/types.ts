interface EventByReTypeProps {
  parentId: number | null;
  reId: number;
  reType: string;
  reName: string;
  comments: string | null;
  spId: number | null;
  reCode: string | null;
  reAttr: any | null;
  // children?: EventByReTypeProps[];
}

interface RatePlans {
  ratePlanId: number;
  ratePlanName: string;
  ratePlanType: string;
  ratePlanCode: string;
  priority: number;
  mappingExit: string | null;
  ratePlanMapping: string;
  offerVerId: number;
  reId: number;
  templateFlag: string;
  remarks: string;
}

interface RatePlanDetail {
  id: number;
  reId: number;
  offerVerId: number;
  ratePlanType: string;
  priority: number | null;
  ratePlanName: string;
  templateFlag: string;
  remarks: string | null;
  srcRatePlanId: number | null;
  spId: number;
  ratePlanCode: string;
  mappingExit: string | null;
}

interface CreateRatePlan {
  offerVerId: number;
  reId: number;
  ratePlanName: string;
  ratePlanCode: string;
  remarks: string | null;
  ratePlanType: string;
  templateFlag: string;
  catalogId: number | null;
  spId: number;
  ratePlanZones: RatePlanZone[] | null;
}

interface UpdateRatePlan {
  ratePlanName: string;
  ratePlanCode: string;
  remarks: string;
}

interface RatePlanZone {
  priority: number;
  mappingSrcType: string | null;
  mappingSrcValue: string | null;
  mappingDesValue: string | null;
  mappingDesType: string | null;
  labelShow: string | null;
}

interface PriceDetail {
  priceId: number;
  priceName: string;
  payIndicator: string | null;
  priceAcctItemTypeId: number;
  value: number;
  calcPrecision: string | null;
  rum: number | null;
  reAttr: number;
  reAttrName: string;
  comments: string | null;
  priceVerId: number;
  calcDisAitId: number | null;
  parentPriceId: number | null;
  mappingId: number | null;
  effDate: string;
  expDate: string | null;
  acctItemTypeName: string;
  acctItemTypeId: number;
  acctResName: string;
  isCurrency: string;
  creditLimit: number | null;
  priority: number;
  ratePrecision: string | null;
  depositTypeId: number | null;
  depositTypeName: string | null;
  param: string | null;
  shareFlag: string | null;
  ratePlanId: number;
  ratePlanType: string;
  offerVerId: number;
  acctItemTypeIdParam: number;
  valueString: string;
}

interface CreatePriceVersion {
  priceVerId?: number;
  offerVerId: number;
  ratePlanId: number;
  effDate: string;
  expDate: string;
  reId: number;
  priceName: string;
  acctItemTypeId: number | null;
  price: string;
  payIndicator: string | null;
  rum: number;
  reAttr: number | null;
  comments: string;
}

interface PriceVersion {
  priceVerId: number;
  effDate: string | null;
  expDate: string | null;
  date: string | null;
  price: Price[];
}

interface Price {
  reType: string;
  priceId: number;
  priceName: string;
  valueString: "0";
  rum: number;
  acctResName: string;
  acctItemTypeName: string | null;
  reAttrName: string;
}

interface UpdateVersion {
  effDate: string;
  expDate: string;
  priceName: string;
  acctItemTypeId: number | null;
  price: string;
  payIndicator: string | null;
  rum: number;
  reAttr: number | null;
  comments: string;
}
