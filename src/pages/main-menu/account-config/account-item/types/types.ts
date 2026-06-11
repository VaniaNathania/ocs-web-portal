interface AccountItemDetail {
  balTypeName: string;
  acctItemTypeId: number;
  balType: number;
  billPriority: number;
  acctResName: string;
  acctResId: number;
  isCurrency: string | null;
  acctItemTypeName: string | null;
}

interface CreateAccountItem {
  acctResId: number | null;
  parentId: number;
  exchangeItemTypeId: number;
  acctItemTypeName: string;
  comments: string | null;
  acctItemTypeCode: string | null;
  usageType: string | null;
  spId: number;
  gstType: string | null;
  feeType: string | null;
  zeroFeePrintFlag: string | null;
  defaultTaxItemTypeId: number | null;
  feeClass: string | null;
  billPriority: number | null;
  acctItemGroupId: number | null;
  billItemType: string | null;
  taxAcctItemTypeId: number | null;
  discountAcctItemTypeId: number | null;
  taxApplyId: number | null;
}
interface UpdateAccountItem {
  acctResId: number | null;
  parentId: number;
  exchangeItemTypeId: number;
  acctItemTypeName: string;
  comments: string | null;
  acctItemTypeCode: string | null;
  usageType: string | null;
  spId: number;
  gstType: string | null;
  feeType: string | null;
  zeroFeePrintFlag: string | null;
  defaultTaxItemTypeId: number | null;
  feeClass: string | null;
  billPriority: number | null;
  acctItemGroupId: number | null;
  billItemType: string | null;
  taxAcctItemTypeId: number | null;
  discountAcctItemTypeId: number | null;
  taxApplyId: number | null;
}

interface GetChild {
  stdCode: string | null;
  unitTypeId: number;
  comments: string | null;
  balTypeName: string;
  balType: number;
  refillable: string;
  unitTypeName: string | null;
  acctResName: string;
  acctResId: number;
  isCurrency: string | null;
  paymentForce: string | null;
  isFreeUnit: string | null;
}

interface GetParent {
  id: number;
  acctItemTypeName: string | null;
}

interface GetBalType {
  comments: string | null;
  balTypeName: string;
  balType: number;
}

interface SearchBalancedType {
  acctResId: number;
  balType: number;
  balTypeName: string;
  parentAcctResId: number | null;
  acctResName: string;
  isCurrency: string;
  comments: string | null;
  creditLimit: number | null;
  remindDay: number | null;
  remindValue: number | null;
  maxValue: number | null;
  refillable: string;
  paymentForce: string;
  stdCode: string | null;
  isFreeUnit: string;
  defaultAcctItemType: number;
  spId: number | null;
  unitTypeId: number | null;
  unitPrecision: number | null;
  ratioMoney: number | null;
  ratioPrecision: number | null;
  priority: number | null;
  extendRule: string | null;
  maxExpDate: number | null;
  maxAdjustValue: number | null;
  maxChgValue: number | null;
  resetZero: string;
  periodClass: string | null;
  storeUnit: number | null;
  acmType: string | null;
  acmThreshold: number | null;
  acmUnit: string | null;
  acmAmount: number | null;
  ceilLimit: number | null;
  floorLimit: number | null;
  dailyCeilLimit: number | null;
  dailyFloorLimit: number | null;
  gracePeriod: number | null;
  maxRollover: number | null;
  usageType: number | null;
  rewardFlag: string;
  unlimitedFlag: string;
  adjustType: number | null;
  overdraftFlag: string;
  balanceAggregation: string;
  category: string | null;
  rolloverFlag: string;
  reservePercentage: number | null;
  freeFlag: string;
  adjustFlag: string;
  balCategory: string;
  clearFlag: string;
  clearDays: number | null;
  customerFlag: string;
  acctResFree: {
    value: number | null;
    rum: number | null;
    spId: number | null;
  } | null;
  transAcctResCfg: {
    dayThreshold: number | null;
    weekThreshold: number | null;
    monthThreshold: number | null;
    dayCount: number | null;
    weekCount: number | null;
    monthCount: number | null;
    minResidualBal: number | null;
    maxAllowed: number | null;
    minAllowed: number | null;
    transferFactor: number | null;
  } | null;
  dayThreshold: number | null;
  weekThreshold: number | null;
  monthThreshold: number | null;
  dayCount: number | null;
  weekCount: number | null;
  monthCount: number | null;
  minResidualBal: number | null;
  maxAllowed: number | null;
  minAllowed: number | null;
  transferFactor: number | null;
  rum: number | null;
  value: number | null;
}
