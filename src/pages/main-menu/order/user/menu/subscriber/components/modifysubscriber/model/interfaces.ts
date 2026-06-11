import { CustomerInfo } from "@/pages/main-menu/order/models/interfaces";
import { OfferDetail } from "../../mockModSubs";

export interface TimerEventList {
  timerEventId: number;
  objSubsEventId: number;
  srcSubsEventId: number | null;
  srcOrderItemId: number | null;
  objOrderItemId: number | null;
  createdDate: string;
  expDate: string;
  state: string;
  stateDate: string;
  comments: string | null;
  custId: string | null;
  subsId: number;
  extAttr: string;
  partyType: string;
  partyCode: string;
  spId: number;
  partId: number;
  custOrderId: number | null;
  accNbr: number | null;
  parentTimerEvenId: number | null;
  reversedTimerEventId: number | null;
  errorMessage: string | null;
  oldExpDate: string;
  reactivationDateType: string | null;
  duration: string | null;
  timeUnit: string | null;
  dependProdSpecId: number | null;
}

export interface StartOrderFlow {
  custOrderId: number;
  partyType?: string;
  partyCode?: string;
  certType?: string;
  custId: number;
  acceptDate: string;
  createdDate: string;
  contact?: string;
  confirmDate?: string;
  spId?: number;
  discountCharge?: string;
  promotionPlanId?: number;
  orderState: string;
  stateDate?: string;
  dispatchOrderId?: number;
  cashDeskFee?: CashDeskFee[];
  // eventPaymentData?:EventPaymentData;
  custOrderNbr: string;
  custContact: CustContact;
  orderItemList: OrderItemList[];
  contactChannelId: number;
  channelType?: string;
  reSubsOrderInstList?: any[];
  reCcInstDataList?: any[];
  eventPaymentData?: EventPaymentData;
  staffInfo: StaffInfo;
  acctList?: any[];
  timerEventList?: TimerEventList[];
  subsId?: number;
  acctId?: number;
  posSaleMode?: string;
  injectType?: string;
  isCarryHandset?: string;
  isNeedQryFee?: string;
  isNeedPayment?: string;
  callTransfer?: string;
  currentOrderItem?: string;
  cust: CustomerInfo;
  deductAcctId?: number;
  sendProvisioningFlag?: string;
  isNeedSave?: string;
  routingId?: number;
  creditLimitMode?: string;
  apartyCode: string;
  apartyType: string;
}

export interface Cust {
  custId: number;
  custCode: string;
  custName: string;
  firstName?: string;
  secondName?: string;
  thirdName?: string;
  fourName?: string;
  custType: string;
  certId: number;
  parentId?: number;
  areaId?: number;
  impGradeId?: number;
  address?: string;
  industryId?: number;
  occupationId?: number;
  custTitleId?: number;
  email?: string;
  gender: null | string;
  birthdayDay?: string;
  phoneNumber?: string;
  pwd: string;
  doc?: string;
}

export interface CustContact {
  extMap: EXTMap;
  valid: boolean;
  custContactId: number;
  custId: number;
  contactEventId: string;
  parentCustContactId?: number;
  createdDate?: string;
  contactType: string;
  partyType?: string;
  partyCode?: string;
  contactObj?: string;
  ipPort?: string;
  contactContent?: string;
  relaId: number;
  appId?: number;
  spId?: number;
  contactChannelId: number;
  transactionId?: number;
  partId?: number;
  qtVerId?: number;
}

export interface EXTMap {}

export interface OrderItemList {
  extMap: EXTMap;
  valid: boolean;
  subsBaseOrder?: SubsBaseOrderDto;
  indepProdOrderAttrList?: any[];
  dpOfferOrderList: DPOfferOrderList[];
  resOrderList?: ResOrderDTO[];
  subsBindOrderList?: any[];
  custProfOrderList?: any[];
  homeZoneOrderList?: any[];
  homeCellOrderList?: any[];
  fellowNbrOrderList?: any[];
  creditLimitOrderList?: any[];
  simCardInfoOrderList?: any[];
  orderItemAttrList?: any[];
  balShareOrderList?: any[];
  goodsOrderList?: any[];
  batchResOrderList?: any[];
  bcMemberOrder?: string;
  individualLifecycleOrderList?: any[];
  orderRelaList?: any[];
  creditBalanceOrderList?: any[];
  cdrPrintOrder?: string;
  prodModified: boolean;
  subsModified: boolean;
  orderItemId: number;
  orderNbr?: string;
  subsId: number;
  prefix: string;
  accNbr: string;
  custOrderId: number;
  subsEventId: number;
  orderState: string;
  stateDate: string;
  operationType: string;
  bespDate?: string;
  completedDate?: string;
  comments?: string;
  orderReasonId?: number;
  orderReason?: string;
  cancelReason?: string;
  cancelPartyType?: string;
  cancelPartyCode?: string;
  orderId?: number;
  timerDate?: string;
  surveyState?: string;
  bespNo?: string;
  offerId: number;
  instalmentTypeId?: number;
  orderType: string;
  eventPaymentId?: number;
  spId?: number;
  priority?: string;
  oppId?: number;
  mkOrderId?: number;
  paymentFlag?: string;
  subsPlanId: number;
  bespAddress?: string;
  offerName: string;
  subsPlanName: string;
  now?: string;
  accNbrId?: number;
  oldAccNbr?: string;
  oldPrefix?: string;
  oldAccNbrId?: number;
  simCardId?: number;
  oldSimCardId?: number;
  oldIccid?: string;
  iccid?: string;
  stdAddrId?: number;
  stdAddrName?: string;
  oldStdAddrId?: number;
  oldStdAddrName?: string;
  subs: Subs;
  prod: Prod;
  cust: Cust;
  acctNbr: string;
  custName: string;
  custId: number;
  acctId: number;
  acct: Acct;
  custProf?: CustProfDto;
  custModifyType: string;
  acctProf?: string;
  deliveryInfoList?: any[];
  creditLimit?: string;
  servType: number;
  injectFlag?: string;
  carryHandset?: string;
  imsi?: string;
  prodState: string;
  blockReason?: string;
  postpaid: string;
  posSaleMode?: string;
  partyType?: string;
  partyCode?: string;
  custInfoDto?: string;
  batchResNum?: string;
  isReserve: boolean;
  refAttr?: string;
  bundleMemberAlias?: string;
  isCheckOweCharge: boolean;
  contactChannelId: number;
  transactionId?: number;
  archiveInfo: ArchiveInfo;
  isCalRatingFee?: string;
  creditBalance?: string;
  isSaved: boolean;
  feeSubsId?: number;
  feeAcctId?: number;
}

export interface CustProfDto {
  orderItemId?: number;
  custId?: number;
  custName?: string;
  oldCustName?: string;
  custType?: string;
  oldCustType?: string;
  impGradeId?: number;
  oldImpGradeId?: number;
  address?: string;
  oldAddress?: string;
  stdAddrId?: number;
  oldStdAddrId?: number;
  gender?: string;
  oldGender?: string;
  custTitleId?: number;
  oldCustTitleId?: number;
  birthdayDay?: string;
  oldBirthdayDay?: string;
  phoneNumber?: string;
  oldPhoneNumber?: string;
  email?: string;
  oldEmail?: string;
  areaId?: number;
  oldAreaId?: number;
  zipcode?: string;
  oldZipcode?: string;
  industryId?: number;
  oldIndustryId?: number;
  occupationId?: number;
  oldOccupationId?: number;
  religionId?: number;
  oldReligionId?: number;
  comments?: string;
  oldComments?: string;
  certId?: number;
  oldCertId?: number;
  certTypeId?: number;
  oldCertTypeId?: number;
  certNbr?: string;
  oldCertNbr?: string;
  issueOrg?: string;
  oldIssueOrg?: string;
  effDate?: string;
  oldEffDate?: string;
  expDate?: string;
  oldExpDate?: string;
  issueDate?: string;
  oldIssueDate?: string;
  certAddress?: string;
  oldCertAddress?: string;
  pwd?: string;
  oldPwd?: string;
  firstName?: string;
  secondName?: string;
  thirdName?: string;
  fourName?: string;
  custProfAttrList?: CustProfAttrDto[];

  custProfOrderId?: number;
  tableName?: string;
  instId?: number;
  fieldName?: string;
  fieldValue?: string;
  oldFieldValue?: string;
  operationType?: string;
  spId?: number;
  attrId?: number;
}

export interface CustProfAttrDto {
  custId?: number;
  attrId?: number;
  oldValue?: string;
  attrValue?: string;
}

export interface ResOrderDTO {
  resOrderId?: number;
  orderItemId?: number;
  resType?: string;
  resInstId?: number;
  oldResInstId?: number;
  operationType?: string;
  spId?: number;
}

export interface SubsBaseOrderDto {
  orderItemId?: number;
  indepProdSpecId?: number;
  defLangId?: number;
  custId?: number;
  userId?: number;
  acctId?: number;
  ppsPwd?: string;
  subsPlanId?: number;
  ageExpDate?: string;
  oldCustId?: number;
  oldUserId?: number;
  oldAcctId?: number;
  oldDefLangId?: number;
  oldPpsPwd?: string;
  oldAgeExpiryDate?: string;
  oldSubsPlanId?: number;
  oldProdSpecId?: number;
  oldEffDate?: string;
  oldExpDate?: string;
  completedDate?: string;
  absEffDate?: string;
  absExpDate?: string;
  relEffOffset?: number;
  relEffUnit?: string;
  relExpOffset?: number;
  relExpUnit?: string;
  operationType?: string;
  spId?: number;
  ppsCreditLimit?: number;
  oldPpsCreditLimit?: number;
  routingId?: number;
  oldRoutingId?: number;
  orgId?: number;
  oldOrgId?: number;
  agentId?: number;
  oldAgentId?: number;
  areaId?: number;
  oldAreaId?: number;
  subsPlanName?: string;
  servType?: number;
  acctNbr?: string;
  custName?: string;
  userName?: string;
  postpaid?: string;
  oldCustName?: string;
  oldUserName?: string;
  oldCustCertInfo?: string;
  oldUserCertInfo?: string;
  oldAcctNbr?: string;
  defLangName?: string;
  areaName?: string;
  oldSubsPlanName?: string;
  oldProdSpecName?: string;
  upgradeType?: string;
  relAgmOffset?: number;
  relAgmUnit?: string;
  saleFlag?: string;
  offerAgeExpDate?: string;
  agmEffDate?: string;
  oldAgmEffDate?: string;
  oldPostpaid?: string;
  activeDate?: string;
}

export interface Acct {
  acctId: number;
  custId: number;
  billingCycleTypeId: number;
  postpaid: string;
  routingId: number;
  billFormatId?: number;
  spId: number;
  billingCycleTypeDto?: string;
  bankAcctIssueDate?: string;
  deliverMethod: string;
  stdAddrId?: number;
  billAddress?: string;
  acctNbr: string;
  paymentType: string;
  bankId?: number;
  bankAcctNbr?: string;
  bankAcctName?: string;
  createdDate: string;
  updateDate: string;
  state: string;
  stateDate: string;
  defaultFlag: string;
  paymentMethodId: number;
  isLock?: string;
  partyType: string;
  partyCode: string;
  bankAcctExpDate?: string;
  bankCardType?: string;
  needUpload?: string;
  paymentComments?: string;
  custBillDeliveryInfoId: number;
  acctName?: string;
  billFlag: string;
  parentAcctId?: number;
  balId?: number;
  billCurrency?: string;
  isHybridOffer?: string;
  defLangId?: number;
  allowModStateDate?: string;
  operationType?: string;
  mandateId?: number;
  creditLimit?: string;
  industryId?: number;
  payerNumber?: string;
  rutNbr?: string;
  rutName?: string;
  fingerMark?: string;
  createPartyType?: string;
  createPartyCode?: string;
  balance?: string;
}

export interface ArchiveInfo {
  oldProdState?: string;
  newProdState?: string;
}

export interface DPOfferOrderList {
  extMap?: EXTMap;
  valid?: boolean;
  dpOrderId?: number;
  orderItemId?: number;
  offerInstId?: number;
  offerId: number;
  offerPkgId?: number;
  oldOfferPkgId?: number;
  absEffDate?: string;
  absExpDate?: string;
  relEffOffset?: string;
  relEffUnit?: string;
  relExpOffset?: string;
  relExpUnit?: string;
  operationType: string;
  agmExpDate?: string;
  oldAgmExpDate?: string;
  oldEffDate?: string;
  oldExpDate?: string;
  spId?: number;
  offerName: string;
  offerType: string;
  offerGroupId?: number;
  offerGroupType?: string;
  offerGroupName?: string;
  offerPackageName?: string;
  effType?: string;
  offerSeq?: string;
  parentOfferSeq?: string;
  duplicateFlag?: string;
  servType?: string;
  reserveDate?: string;
  oldReserveDate?: string;
  timerEventId?: number;
  dpOfferOrderAttrList: DPOfferAttrList[];
  relAgmUnit?: string;
  relAgmOffset?: string;
  offer?: OfferDetail;
  rental?: string;
  isNeedQryFee?: string;
  isCalRatingFee?: string;
  chargeFlag?: string;
  reserveDpOffer: boolean;
}

export interface DPOfferAttrList {
  attrName?: string;
  attrValue?: string;
  value?: string;
  valueMark?: string;
  offerId: number;
  attrId: number;
  operationType: string;
  oldValue?: string;
  oldValueMark?: string;
}

export interface Prod {
  prodId: number;
  offerId: number;
  completedDate: string;
  prodState: string;
  subsPlanId: number;
  packageFlag: string;
  parentProdId?: number;
  indepProdId?: number;
  prodStateDate: string;
  updateDate: string;
  createdDate: string;
  state: string;
  stateDate: string;
  blockReason?: string;
  prodExpDate?: string;
  needUpload?: string;
  agreementExpDate?: string;
  spId: number;
  agreementEffDate: string;
  agreementLimit?: string;
  agreementTimeUnit?: string;
  routingId: number;
  activeDate?: string;
  uploadType?: string;
  promotionItemId?: number;
  prodAlias?: string;
  parentOfferId?: number;
}

export interface Subs {
  subsId: number;
  prefix: string;
  accNbr: string;
  custId: number;
  userId: number;
  acctId: number;
  agentId?: number;
  areaId: number;
  updateDate: string;
  ppsCreditLimit: number;
  routingId: number;
  defLangId: number;
  spId: number;
  ppsPwd: string;
  prodDto?: string;
  pricePlanId?: number;
  orgId: number;
}

export interface StaffInfo {
  staffId?: number;
  staffName?: string;
  staffJobId?: number;
  jobId?: number;
  jobName?: string;
  orgId?: number;
  orgCode?: string;
  orgName?: string;
  areaId?: number;
  areaName?: string;
  areaCode?: string;
}

// Generated by https://quicktype.io

export interface CashDeskFee {
  receivableCharge: number;
  orgId: number;
  contactChannelId: number;
  children: CashDeskFeeChild[];
  staffId: number;
  custOrderId: number;
  deposit: number;
  isNeedPayment: string;
  discountCharge: number;
  promotionPlanGrade: string;
}

export interface CashDeskFeeChild {
  subsEventName: string;
  receivableCharge: number;
  orgId: number;
  instalmentTypeName: string;
  accNbr: string;
  acctId: number;
  receivedCharge: number;
  staffId: number;
  offerId: number;
  orderType: string;
  promotionPlanGrade: string;
  subsEventId: number;
  columnType: string;
  subsPlanName: string;
  contactChannelId: number;
  children: PurpleChild[];
  orderNbr: string;
  isNeedPayment: string;
  orderItemId: number;
  acctNbr: string;
  postpaid: string;
  selected: boolean;
}

export interface PurpleChild {
  orgId: number;
  receivableCharge: number;
  receivedCharge: number;
  staffId: number;
  offerId: number;
  orderType: string;
  promotionPlanGrade: string;
  subsEventId: number;
  priceName: string;
  subsPlanName: string;
  contactChannelId: number;
  children: FluffyChild[];
  orderNbr: number;
  isNeedPayment: string;
  orderItemId: number;
  discountCharge: number;
  subOrderId: number;
}

export interface FluffyChild {
  isOnceFee: string;
  receivableCharge: number;
  receivedCharge: number;
  manualDiscountCharge?: number;
  priceId?: number;
  priceName: string;
  manualDiscount?: string;
  acctItemType?: string;
  isCurrency: string;
  orderItemId?: number;
  acctResName: string;
  discountCharge: number;
  subOrderId?: number;
  unitTypeName?: string;
}

// Generated by https://quicktype.io

export interface Eventpay {
  eventPaymentData: EventPaymentData;
}

export interface EventPaymentData {
  eventInstIdList?: number[];
  fromCsr: boolean;
  createdDate?: string;
  spId: number;
  partyType: string;
  eventPaymentId?: number;
  eventPaymentSn?: number;
  charge: number;
  acctId?: number;
  oriCharge: number;
  instantPaymentList?: InstantPayment[];
  balDeductDataList?: BALDeductDataList[];
  contactChannelId: number;
  discountCharge: number;
  partyCode: string;
}

export interface BALDeductDataList {
  deductAcctBook: DeductAcctBook;
  balDeductCharge: number;
  acctId?: number;
  balDeductAcctResId: number;
  eventInstId?: number;
  priceId: number;
  effSeconds: number;
  deductSeq: number;
  effDate?: string;
  acctBookId?: number;
  seq: number;
}

export interface DeductAcctBook {
  acctResId: number;
  preSuttleBal: number;
  createdDate?: string;
  preExpDate?: string;
  acctId?: number;
  refAttr: string;
  seconds: number;
  spId: number;
  preEffDate?: string;
  eventInstId?: number;
  effSeconds: number;
  preBalance: number;
  billId?: number;
  partyType: string;
  acctBookType: string;
  contactChannelId: number;
  eventPaymentId?: number;
  balId: number;
  acctBookId?: number;
  charge: number;
  partyCode: string;
}

export interface InstantPayment {
  createdDate?: string;
  spId: number;
  returnAmount: number;
  partyType: string;
  eventPaymentId?: number;
  paymentId?: number;
  charge: number;
  paymentMethodId: number;
  submitAmount: number;
  partyCode: string;
}

export interface orderInfoForm {
  bespAddress?: string;
  comments?: string;
}

// Generated by https://quicktype.io

export interface QryDefaultBAL {
  balId: number;
  acctId: number;
  acctResId: number;
  subsId: number;
  custId: number;
  grossBal: number;
  reserveBal: number;
  consumeBal: number;
  ratingBal: number;
  billingBal: number;
  realBal: number;
  lastBal: number;
  usedBal: number;
  charge: number;
  seconds: number;
  preBalance: number;
  preSuttleBal: number;
  preEffDate: string;
  preExpDate: string;
  effDate: string;
  expDate: string;
  updateDate: string;
  minExpDate: string;
  ceilLimit?: number;
  ceilLimitCharge: null;
  floorLimit?: number;
  dailyCeilLimit?: number;
  dailyFloorLimit?: number;
  priority: null;
  balCode: null;
  routingId: number;
  absExpOffset: null;
  changeInitBal: null;
  initBal: number;
  lastRecharge: null;
  balUsed: number;
  operationType: null;
  acctResName: string;
  acctResComments: null;
  balFlags: null;
  isCurrency: null;
  isExpired: null;
  refAttr: string;
  checkMode: string;
  postCheckMode: string;
  balShareInWorkHourFlag: string;
  consumeBalCharge: null;
  balShareId: number;
  varCeilLimit?: number;
  grossSubBal: null;
  effSeconds: number;
  acctResDto: AcctResDto;
  balAcctItemTypeDtoList: null;
  balShareDtoList: null;
  balShareItemDtoList: null;
}

export interface AcctResDto {
  acctResId: number;
  balType: number;
  parentAcctResId: number;
  acctResName: string;
  isCurrency: string;
  comments: null;
  creditLimit?: number;
  remindDay: null;
  remindValue: null;
  maxValue: number;
  refillable: string;
  paymentForce: string;
  stdCode: string;
  isFreeUnit: string;
  defaultAcctItemTypeId: number;
  spId: number;
  unitTypeId: number;
  unitPrecision: null;
  unitTypeDto: UnitTypeDto;
  ratioMoney: null;
  ratioPrecision: null;
  priority: null;
  extendRule: string;
  maxExpDate: string;
  maxAdjustValue: null;
  maxChgValue: null;
  resetZero: null;
  periodClass: null;
  storeUnit: null;
  acmType: null;
  acmThreshold: null;
  acmUnit: null;
  acmAmount: null;
  ceilLimit?: number;
  floorLimit?: number;
  dailyCeilLimit?: number;
  dailyFloorLimit?: number;
  gracePeriod: null;
  maxRollover: null;
  usageType: null;
  rewardFlag: string;
  unlimitedFlag: string;
  adjustType: number;
  overdraftFlag: null;
  balanceAggregation: string;
  category: null;
  rolloverFlag: string;
  reservePecentage: null;
  freeFlag: string;
  adjustFlag: null;
  balCategory: string;
  clearFlag: string;
  clearDays: null;
  customerFlag: null;
}

export interface UnitTypeDto {
  unitTypeId: number;
  unitTypeName: string;
  comments: null;
  unitCode: string;
  state: string;
  stateDate: string;
  spId: number;
  trafficType: number;
}

export interface PaymentAmount {
  cash: string;
  balance: string;
}
