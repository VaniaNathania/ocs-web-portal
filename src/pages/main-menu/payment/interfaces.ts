export interface AcctInfoPayment {
  acctId: number;
  custId: number;
  acctNbr: string;
  accNbr?: string;
  acctName: string;
  billingCycleTypeId: number;
  billFormatId?: number;
  postpaid: "N" | "Y";
  stdAddrId?: number;
  billAddress?: string;
  paymentType: string;
  paymentMethodId?: number;
  bankId?: number;
  bankAcctNbr?: string;
  bankAcctName?: string;
  createdDate: string;
  updateDate: string;
  state: string;
  stateDate: string;
  billingCycleTypeName: string;
  defaultFlag?: "Y" | "N";
  paymentTypeName: string;
  bankName?: string;
  custName: string;
  certNbr?: string;
  certTypeName?: string;
  address?: string;
  isProject: "N" | "Y";
  routingId: number;
  paymentMethodName?: string;
  paymentComments?: string;
  bankCardType?: string;
  isLock?: "Y" | "N";
  spId: 0;
  allowModStateDate?: string;
  custType?: string;
}

export const mock: AcctInfoPayment = {
  updateDate: "2024-12-06 14:13:11",
  certTypeName: "Passport",
  routingId: 1,
  defaultFlag: "N",
  certNbr: "06435435445",
  paymentTypeName: "Automatic payment",
  postpaid: "N",
  acctId: 120254114,
  acctName: "asd",
  billingCycleTypeName: "PREPAID",
  paymentMethodName: "Cash",
  custName: "Test Mario",
  spId: 0,
  isProject: "N",
  billingCycleTypeId: 1,
  paymentType: "A",
  createdDate: "2024-12-06 14:13:11",
  paymentMethodId: 1,
  custId: 120257013,
  custType: "A",
  stateDate: "2024-12-06 14:13:11",
  state: "A",
  acctNbr: "930254114",
};

export interface HistoryBill {
  cycleBeginDate: string; //"2025/10/01 00:00:00";
  billNbr: string; //"12084012";
  adjustCharge: number; //"0";
  acctId: number; //"120255000";
  preBalance: number; //"0";
  billingCycleName: string; //"From 2025-10-01 to 2025-11-01";
  cycleEndDate: string; //"2025/11/01 00:00:00";
  disputeCharge: number; //"0";
  unpaidCharge: number; //"0";
  due: number; //"0";
  billingCycleId: number; //"1992";
  billId: number; //"12084012";
  recvCharge: string; //"-100000";
}

export const mockHisBill: HistoryBill[] = [
  {
    cycleBeginDate: "2025/10/01 00:00:00",
    billNbr: "12084012",
    adjustCharge: 0,
    acctId: 120255000,
    preBalance: 0,
    billingCycleName: "From 2025-10-01 to 2025-11-01",
    cycleEndDate: "2025/11/01 00:00:00",
    disputeCharge: 0,
    unpaidCharge: 0,
    due: 0,
    billingCycleId: 1992,
    billId: 12084012,
    recvCharge: "-100000",
  },
  {
    cycleBeginDate: "2025/09/01 00:00:00",
    billNbr: "12084011",
    adjustCharge: 0,
    acctId: 120255000,
    preBalance: 0,
    billingCycleName: "From 2025-09-01 to 2025-10-01",
    cycleEndDate: "2025/10/01 00:00:00",
    disputeCharge: 0,
    unpaidCharge: 0,
    due: 0,
    billingCycleId: 1991,
    billId: 12084011,
    recvCharge: "0",
  },
];

export interface BalanceDetail {
  updateDate: string;
  expDate?: string;
  effDate: string;
  seconds?: string;
  reserveBal: number;
  isCurrency: string;
  balId: number;
  acctResName: string;
  charge: number;
  usedBal: number;
  lastBal: number;
  consumeBal: number;
  realBal: number;
  balUsed: number;
  acctId: number;
  billingBal: number;
  ratingBal: number;
  grossBal: number;
  initBal: number;

  subsId: number;
  acctResId: number;

  balShareInWorkHourFlag: string;

  acctRes: AcctRes;

  // optional empty string fields
  routingId?: string;
  preExpDate?: string;
  preSuttleBal?: string;
  changeInitBal?: string;
  preBalance?: string;
  minExpDate?: string;
  floorLimit?: string;
  balShareItemList?: string;
  ceilLimit?: string;
  absExpOffset?: string;
  dailyFloorLimit?: string;
  secondsStr?: string;
  balAcctItemTypeList?: string;
  balShareList?: string;
  balCode?: string;
  priority?: string;
  dailyCeilLimit?: string;
  extAttr?: string;
  acctResComments?: string;
  realBalStr?: string;
  grossSubBal?: string;
  operationType?: string;
  lastRecharge?: string;
  isExpired?: string;
  balShareId?: string;
  refAttr?: string;
}

export interface AcctRes {
  adjustType?: string;
  balType?: string;
  acctResName: string;
  freeFlag?: string;
  stdCode?: string;
  balCategory?: string;
  acctResId: number;
  unitTypeId?: number;
  customerFlag?: string;
  refillable?: string;
  isCurrency?: string;
  isFreeUnit?: string;
  creditLimit?: string;

  unitType: UnitType;

  // optional empty fields
  periodClass?: string;
  ratioMoney?: string;
  floorLimit?: string;
  remindDay?: string;
  maxChgValue?: string;
  maxValue?: string;
  remindValue?: string;
  overdraftFlag?: string;
  priority?: string;
  dailyCeilLimit?: string;
  defaultAcctItemTypeId?: string;
  ceilLimit?: string;
  dailyFloorLimit?: string;
  parentAcctResId?: string;
  storeUnit?: string;
  adjustFlag?: string;
  reservePecentage?: string;
  usageType?: string;
  clearFlag?: string;
  comments?: string;
  balanceAggregation?: string;
  acmAmount?: string;
  unitPrecision?: string;
  spId?: string;
  unlimitedFlag?: string;
  maxRollover?: string;
  acmThreshold?: string;
  paymentForce?: string;
  acmUnit?: string;
  category?: string;
  clearDays?: string;
  rewardFlag?: string;
  extendRule?: string;
  rolloverFlag?: string;
  maxExpDate?: string;
  maxAdjustValue?: string;
  gracePeriod?: string;
  ratioPrecision?: string;
  acmType?: string;
  resetZero?: string;
}

export interface UnitType {
  unitTypeId: number;
  comments?: string;
  unitCode: string;
  unitTypeName: string;
  trafficType?: number;
  stateDate: string;
  state: string;

  spId?: string;
}

export const mockAccountBallDetail: BalanceDetail[] = [
  {
    updateDate: "2025/11/04 16:53:34",
    expDate: "2026/02/02 14:50:24",
    effDate: "2025/09/26 00:00:00",
    seconds: "0",
    reserveBal: 0,
    acctRes: {
      adjustType: "7",
      balType: "1",
      maxValue: "100000000000",
      acctResName: "Main balance",
      freeFlag: "N",
      stdCode: "0",
      balCategory: "M",
      acctResId: 1,
      unitTypeId: 4,
      customerFlag: "N",
      unitType: {
        unitTypeId: 4,
        unitCode: "$",
        unitTypeName: "$",
        trafficType: 1,
        stateDate: "2023/07/26 09:50:18",
        state: "A",
      },
      refillable: "Y",
      isCurrency: "Y",
      isFreeUnit: "N",
      clearFlag: "N",
      balanceAggregation: "N",
      spId: "0",
      unlimitedFlag: "N",
      paymentForce: "N",
      rewardFlag: "N",
      extendRule: "000000",
      rolloverFlag: "N",
    },
    isCurrency: "Y",
    balId: 11372039,
    acctResName: "Main balance",
    charge: 0,
    usedBal: 0,
    lastBal: 0,
    consumeBal: 0,
    realBal: -100000,
    balUsed: 0,
    acctId: 120255000,
    billingBal: 0,
    subsId: -1,
    balShareInWorkHourFlag: "Y",
    acctResId: 1,
    ratingBal: 0,
    grossBal: -100000,
    initBal: -100000,
  },
  {
    updateDate: "2025/10/22 11:15:21",
    expDate: "2025/12/31 23:59:59",
    effDate: "2025/10/20 12:17:47",
    seconds: "0",
    reserveBal: 0,
    acctRes: {
      adjustType: "7",
      balType: "4",
      acctResName: "Telkomcel Point",
      freeFlag: "Y",
      stdCode: "4001",
      balCategory: "P",
      acctResId: 21,
      unitTypeId: 5,
      unitType: {
        unitTypeId: 5,
        unitCode: "Point",
        unitTypeName: "Point",
        stateDate: "2023/07/27 10:14:42",
        state: "A",
      },
      refillable: "L",
      isCurrency: "N",
      isFreeUnit: "N",
      clearFlag: "Y",
      balanceAggregation: "N",
      spId: "0",
      unlimitedFlag: "N",
      paymentForce: "N",
      clearDays: "2",
      rewardFlag: "N",
      extendRule: "000000",
      rolloverFlag: "N",
    },
    isCurrency: "N",
    balId: 11372067,
    acctResName: "Telkomcel Point",
    charge: 0,
    usedBal: 0,
    lastBal: 0,
    consumeBal: 0,
    realBal: -7,
    balUsed: 0,
    acctId: 120255000,
    billingBal: 0,
    subsId: -1,
    balShareInWorkHourFlag: "Y",
    acctResId: 21,
    ratingBal: 0,
    grossBal: -7,
    initBal: -7,
  },
];

export interface AllBill {
  settCharge: number;
  billNbr: string;
  due: number;
  billId: number;
  adjustCharge: number;
  billingCycleName: string;
}

export const mockAllBill: AllBill[] = [
  {
    settCharge: 0,
    billNbr: "12084011",
    due: 0,
    billId: 12084011,
    adjustCharge: 0,
    billingCycleName: "From 2025-09-01 to 2025-10-01",
  },
  {
    settCharge: 0,
    billNbr: "12084012",
    due: 0,
    billId: 12084012,
    adjustCharge: 0,
    billingCycleName: "From 2025-10-01 to 2025-11-01",
  },
  {
    settCharge: 0,
    billNbr: "12086013",
    due: 0,
    billId: 12086013,
    adjustCharge: 0,
    billingCycleName: "From 2025-11-01 to 2025-12-01",
  },
];

export interface AcctResListM {
  acctResId: number;
  parentAcctResId: number;
  acctResName: string;
  stdCode: string;
  isCurrency: string;
  balType: string;
  creditLimit: number;
  comments: string;
  refillable: string;
}

export interface MasterPayment {
  paymentMethod: PaymentMethod[];
  balanceType: AcctResListM[];
}

export interface WebRechargeQuery {
  billDetail: BillDetail;
  billingCycleDetail: BillingCycleDetail;
  acctInfo: AcctInfo;
  defaultBalInfo: DefaultBALInfo;
  subsList: SubsList[];
  custInfo: any;
}

export interface AcctInfo {
  acctId: number;
  custId: number;
  billingCycleTypeId: number;
  postpaid: string;
  routingId: number;
  billFormatId: number;
  spId: number;
  billingCycleTypeDto: any;
  bankAcctIssueDate: string;
  deliverMethod: string;
  stdAddrId: number;
  billAddress: string;
  acctNbr: string;
  paymentType: string;
  bankId: number;
  bankAcctNbr: string;
  bankAcctName: string;
  createdDate: Date;
  updateDate: Date;
  state: string;
  stateDate: Date;
  defaultFlag: string;
  paymentMethodId: number;
  isLock: string;
  partyType: string;
  partyCode: string;
  bankAcctExpDate: string;
  bankCardType: string;
  needUpload: string;
  paymentComments: string;
  custBillDeliveryInfoId: number;
  acctName: string;
  billFlag: string;
  parentAcctId: number;
  balId: number;
  billCurrency: string;
  isHybridOffer: string;
  defLangId: number;
  allowModStateDate: string;
  operationType: string;
  mandateId: number;
  creditLimit: number;
  industryId: number;
  payerNumber: string;
  rutNbr: string;
  rutName: string;
  fingerMark: string;
  createPartyType: string;
  createPartyCode: string;
  allBalList: any[];
  oldBalList: any[];
  newBalList: any[];
  updateBalList: any[];
  custName: string;
  allSubsList: any[];
  currentBillingCycleId: number;
  bill: string;
  recordBill: string;
}

export interface BillDetail {
  billId: number;
  billNbr: string;
  acctId: number;
  billingCycleId: number;
  preBalance: number;
  due: number;
  disputeCharge: number;
  recvCharge: number;
  pastAdjustCharge: number;
  adjustCharge: number;
  chargeBeAdjusted: string;
  spId: number;
  billCode: string;
  chargeBeReversed: string;
  billExDto: BillExDto;
  routingId: number;
  writeoffCharge: string;
  billingCycleName: string;
  settCharge: string;
  operationType: string;
}

export interface BillExDto {
  billId: number;
  subsEventCharge: number;
  payInTime: string;
}

export interface BillingCycleDetail {
  billingCycleId: number;
  billingCycleTypeId: number;
  cycleBeginDate: string;
  cycleEndDate: string;
  state: string;
  debtDate: Date;
  spId: number;
  runDate: string;
  documentDate: string;
  postingDate: string;
  invoiceDate: string;
  originDate: string;
  notificationDate: string;
}

export interface DefaultBALInfo {
  charge: number;
  seconds: number;
  grossBal: number;
  reserveBal: number;
  consumeBal: number;
  ratingBal: number;
  billingBal: number;
  realBal: number;
  lastBal: number;
  initBal: number;
  balUsed: number;
  balShareInWorkHourFlag: string;
  usedBal: number;
  balId: number;
  acctId: number;
  acctResId: number;
  effDate: Date;
  expDate: Date;
  updateDate: Date;
  ceilLimit: number;
  floorLimit: number;
  dailyCeilLimit: number;
  dailyFloorLimit: number;
  priority: string;
  balCode: string;
  preBalance: string;
  preSuttleBal: string;
  preExpDate: string;
  operationType: string;
  acctResName: string;
  acctResComments: string;
  grossSubBal: string;
  routingId: number;
  acctResDto: any;
  isCurrency: string;
  balAcctItemTypeDtoList: any[];
  extAttr: string;
  balShareDtoList: any[];
  changeInitBal: string;
  lastRecharge: string;
  subsId: number;
  absExpOffset: string;
  refAttr: string;
  balShareId: number;
  balShareItemDtoList: any[];
  isExpired: string;
  minExpDate: string;
  ceilLimitCharge: string;
  balAcctItemTypeList: any[];
  effSeconds: string;
  preEffDate: string;
  checkMode: string;
  postCheckMode: string;
  consumeBalCharge: string;
  varCeilLimit: number;
  balFlags: string;
  custId: number;
}

export interface SubsList {
  defaultPricePlanId: number;
  subsId: number;
  prefix: string;
  accNbr: string;
  custId: number;
  userId: number;
  acctId: number;
  agentId: number;
  areaId: number;
  updateDate: string;
  ppsCreditLimit: number;
  routingId: number;
  defLangId: number;
  spId: number;
  ppsPwd: string;
  prodDto: any;
  pricePlanId: number;
  orgId: number;
  comments: string;
  needUpload: string;
  prod: string;
  prePayFlag: string;
}
