interface Events {
  reId: number;
  offerVerId: number;
  reName: string;
}

interface RatePlans {
  ratePlanId: number;
  ratePlanName: string;
  ratePlanType: string;
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

interface Price {
  reType: string;
  priceId: number;
  priceName: string;
  valueString: "0";
  rum: number;
  calculateUnit: string;
  acctItemTypeName: string | null;
  reAttrName: string;
}

interface DiscountList {
  dpId: number;
  dpName: string;
  priority: number;
  dpType: string;
  dpTypeName: string;
  pricePlanVerId: number;
  billingPlanType: string;
  comments: string;
}

interface AdditionalFormProps {
  isReference: boolean;
  isCalculation: boolean;
  isApplying: boolean;
}

interface DiscountMethodList {
  disctCalcMethod: string;
  disctCalcMethodName: string;
  comments: string;
}

interface DiscountType {
  tabDpType: string;
  tabDpTypeName: string;
}

interface DistributeMethod {
  distributeMethod: string;
  distributeMethodName: string;
}

interface TabularDetailApi {
  tabDpType: string;
  distributeMethod: string;
  negativeFlag: "Y" | "N";
  acctItemTypeId: number | null;
  refDisctObjId: number;
  refDisctObjName: string;
  refDisctObjType: string;
  refMemberAlias: string | null;
  refTabDpCondGrpId: number;
  calcDisctObjId: number;
  calcDisctObjName: string;
  calcDisctObjType: string;
  calcMemberAlias: string | null;
  calcTabDpCondGrpId: number;
  applyDisctObjId: number;
  applyDisctObjName: string;
  applyDisctObjType: string;
  applyMemberAlias: string | null;
  applyTabDpCondGrpId: number;
  tabDpCondGrpId: number;
}

interface Condition {
  grpId: number;
  seqNo: number;
  sortOperator: string;
  ldpRefCondId: number;
  lparam1: string | null;
  rval: string;
}
