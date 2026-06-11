interface IAccmTypeList {
  resourceId: number;
  resourceName: string;
  acmType: string;
  acmTypeName: string;
  mask: string;
  comments: string | null;
  ratableResourceReAttr: number;
  ratableResourceReAttrName: string;
  acmCycleTypeId: number | null;
  timeUnit: number | null;
  quantity: number | null;
  beginDate: string | null;
  timeUnitName: string | null;
  refType: string | null;
  acmCycleTypeReAttr: number | null;
  acmCycleTypeReAttrName: string | null;
  offset: number | null;
  rateTimeUnit: string | null;
  unitTypeId: number | null;
  unitTypeName: string | null;
  unitPrecision: number;
  precision: number | null;
  roundWay: string | null;
  offsetDays: number | null;
  acctResId: number | null;
  acctResName: string | null;
  defReAttr: number | null;
  rum: number | null;
  billingCycleTypeId: number | null;
}

interface MeasurementFeature {
  id: number;
  reAttrName?: string;
}

interface unitType {
  unitTypeId: number;
  unitTypeName: string;
}
interface AccmMode {
  id: string;
  acmTypeName: string;
  comments: string;
}

interface InitDetailAccumulation {
  resourceId: number;
  priceVerId: number;
  effDate: string;
  expDate: string;
  ratePlanName: string;
  pricePlanName: string;
  reNames: string;
  type: string;
}
interface InitDetailTriggerAccumulation {
  resourceId: number;
  effDate: string;
  expDate: null;
  pricePlanName: string;
}

interface InitDetailAccmPrice {
  acmUpId: number;
  pricePlanName: string;
  priceName: string;
  resourceId: number;
  resourceName: string;
  adjustMethod: string;
  rate: number;
  rum: string;
  effValue: number;
  expValue: number;
  timeSpanUpId: null;
}

interface InitDetailAccmCalculation {
  acmCalcId: number;
  pricePlanName: string;
  priceName: string;
  resourceId: number;
  resourceName: string;
  timeSpanUpId: number;
  reAttr: string;
  reAttrName: string;
}
