import { $ZodNullableInternals } from "zod/v4/core";
import { AcctRes } from "../../../interfaces";

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

export interface AccountBalanceDatasProps {
  charge: string | null;
  seconds: string | null;
  grossBal: number;
  reserveBal: number;
  consumeBal: number;
  ratingBal: number;
  billingBal: number;
  realBal: number;
  lastBal: null;
  initBal: number;
  balUsed: number | null;
  balShareInWorkHourFlag: null;
  usedBal: number;
  balId: number;
  acctId: number;
  acctResId: number;
  effDate: string;
  expDate: string;
  updateDate: string;
  ceilLimit: number | null;
  floorLimit: number | null;
  dailyCeilLimit: number | null;
  dailyFloorLimit: number | null;
  priority: number | null;
  balCode: string | null;
  preBalance: string | null;
  preSuttleBal: string | null;
  preExpDate: string | null;
  operationType: string | null;
  acctResName: string;
  acctResComments: string | null;
  grossSubBal: string | null;
  routingId: string | null;
  acctResDto: AcctResDto;
  isCurrency: string;
  balAcctItemTypeDtoList: string | null;
  extAttr: string | null;
  balShareDtoList: BALShareDtoList[] | null;
  changeInitBal: null;
  lastRecharge: null;
  subsId: number;
  absExpOffset: number | null;
  refAttr: string | null;
  balShareId: string | null;
  balShareItemDtoList: string | null;
  isExpired: string | null;
  minExpDate: string | null;
  ceilLimitCharge: string | null;
  balAcctItemTypeList: string | null;
  effSeconds: string | null;
  preEffDate: string | null;
  checkMode: string | null;
  postCheckMode: string | null;
  consumeBalCharge: string | null;
  varCeilLimit: string | null;
  balFlags: string | null;
  custId: string | null;
}

export interface AcctResDto {
  acctResId: number;
  balType: number;
  parentAcctResId: string | null;
  acctResName: string;
  isCurrency: string;
  comments: null | string;
  creditLimit: string | null;
  remindDay: string | null;
  remindValue: string | null;
  maxValue: number | null;
  refillable: string;
  paymentForce: string;
  stdCode: string;
  isFreeUnit: string;
  defaultAcctItemTypeId: string | null;
  spId: number;
  unitTypeId: number;
  unitPrecision: string | null;
  unitTypeDto: UnitTypeDto;
  ratioMoney: string | null;
  ratioPrecision: string | null;
  priority: string | null;
  extendRule: string;
  maxExpDate: string | null;
  maxAdjustValue: string | null;
  maxChgValue: string | null;
  resetZero: string | null;
  periodClass: string | null;
  storeUnit: string | null;
  acmType: string | null;
  acmThreshold: string | null;
  acmUnit: string | null;
  acmAmount: string | null;
  ceilLimit: string | null;
  floorLimit: string | null;
  dailyCeilLimit: string | null;
  dailyFloorLimit: string | null;
  gracePeriod: string | null;
  maxRollover: string | null;
  usageType: string | null;
  rewardFlag: string;
  unlimitedFlag: string;
  adjustType: number;
  overdraftFlag: string | null;
  balanceAggregation: string;
  category: string | null;
  rolloverFlag: string;
  reservePecentage: string | null;
  freeFlag: string;
  adjustFlag: string | null;
  balCategory: string;
  clearFlag: string;
  clearDays: number | null;
  customerFlag: null | string;
}

export interface UnitTypeDto {
  unitTypeId: number;
  unitTypeName: string;
  comments: string | null;
  unitCode: string;
  state: string;
  stateDate: string;
  spId: number | null;
  trafficType: number | null;
}

export interface BALShareDtoList {
  balShareId: number;
  subsId: number;
  prodId: string | null;
  subsUppInstId: string | null;
  balId: number;
  effDate: string | null;
  expDate: string | null;
  ceilLimit: string | null;
  priority: number;
  paymentForce: string;
  dailyCeilLimit: string | null;
  spId: string | null;
  acctId: number;
  acctNbr: string | null;
  acctResId: number;
  acctResDto: string | null;
  custId: string | null;
  custName: string | null;
  usableLimit: string | null;
  balShareItemDtoList: string | null;
  prefix: string | null;
  accNbr: string | null;
  msisdn: string | null | string;
  shareType: string | null;
  usedAmount: string | null;
  balTypeName: string | null;
  children: string | null;
  processType: string | null;
  routingId: string | null;
  balCode: string | null;
  cycleConsume: string | null;
  dailyConsume: string | null;
  balShareDetailId: string | null;
  isCurrency: string | null;
  isHybrid: string | null;
  bsTemplateId: string | null;
  billingCycleId: string | null;
  bsTypeId: string | null;
  bsTypePtlId: string | null;
  operationType: string | null;
  partyType: string | null;
  partyCode: string | null;
  comments: string | null;
  ownerPrefix: string | null;
  ownerAccNbr: string | null;
  ownerSubsId: string | null;
}

export interface BalanceDialogForm {
  ceilLimit: number | null;
  floorLimit: number | null;
  dailyCeilLimit: number | null;
  dailyFloorLimit: number | null;
  priority: number | null;
}

export interface PointExchangeDialogForm {
  spendAmount: number | null;
  objAmount: number | null;
  balExchangeRuleId: string | null;
  partyType: string | null;
  contactChannelId: number | null;
  sourceBalId: number | null;
  objAcctResId: string | null;
  subsId: number | null;
  acctId: number | null;
}

export interface ValidBallExchangeRule {
  effDate: string;
  balExchangeRuleId: string;
  srcAcctResId: number;
  objValue: number;
  balExchangeRuleName: string;
  exchangeType: string;
  srcValue: number;
  objExpOffsetType: string;
  objAcctResId: string;
}

export interface AcctResList {
  stdCode?: string | null;
  comments?: string | null;
  balType?: string;
  refillable?: string | null;
  acctResName?: string;
  acctResId?: string;
  isCurrency?: string;
  parentAcctResId?: string;
}

export type BalanceDialogFields = keyof BalanceDialogForm;

export type DialogType = "Ceil" | "Daily" | "BalanceSuccess" | "PointExchange" | null;
