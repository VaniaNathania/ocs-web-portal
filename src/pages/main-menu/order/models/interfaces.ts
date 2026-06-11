import { FeatureData } from "../../offer/main-product/components/DetailCategoryContent/FeatureTabContent";

export interface OrderSideBar {
  title: string;
  icon: string;
  path: string;
}

export interface CustomerInfo {
  certTypeName?: string;
  defLangId?: number;
  needUpload?: string;
  certTypeId?: number;
  cert?: string;
  thirdName?: string;
  certAddress?: string;
  expDate?: string;
  effDate?: string;
  industryId?: number;
  areaName?: string;
  occupationId?: number;
  isWs?: string;
  custTypeName?: string;
  state?: string;
  createPartyType?: string;
  custCreditGradeName?: string;
  impGradeName?: string;
  certNbr?: string;
  netType?: string;
  contactFixNbr?: string;
  zipcode?: string;
  firstName?: string;
  phoneNumber?: string;
  titleName?: string;
  birthdayDay?: string;
  custType?: string;
  custCreditGradeId?: number;
  custSubSegment?: string;
  operationType?: string;
  pwd?: string;
  stdAddrId?: number;
  updateDate?: string;
  routingId?: number;
  gender?: string;
  custSegment?: string;
  occupationName?: string;
  impGradeId?: number;
  decisionMakers?: string;
  decisionMakersContact?: string;
  religionId?: number;
  partyType?: string;
  fourName?: string;
  custTitleId?: number;
  custId?: number;
  religionName?: string;
  issueDate?: string;
  email?: string;
  secondName?: string;
  industryName?: string;
  address?: string;
  comments?: string;
  vatNo?: string;
  createPartyCode?: string;
  certId?: number;
  custName?: string;
  spId?: number;
  custCode?: string;
  issueOrg?: string;
  parentId?: number;
  createdDate?: string;
  areaId?: number;
  partyCode?: string;
  issueCountry?: string;
  stateDate?: string;
}

export interface CustBillDelivery {
  updateDate?: string;
  ccEmail?: string;
  detailInfo?: string;
  stdAddr?: string;
  partyCodeName?: string;
  partyType?: string;
  spId?: string;
  zipcode?: string;
  custBillDeliveryInfoId?: number;
  createdDate?: string;
  smsNbr?: string;
  partyCode?: string;
  custId?: string;
  state?: string;
  faxNbr?: string;
  email?: string;
  fileType?: string;
  stdAddrId?: string;
}

export interface AccountInfo {
  defLangId?: string;
  noSubsFlag?: string;
  rutName?: string;
  needUpload?: string;
  allowModStateDate?: string;
  custBillDeliveryInfoId?: number;
  industryId?: string;
  billFlag?: string;
  deliverMethod?: string;
  creditLimit?: string;
  custBillDelivery?: CustBillDelivery;
  balId?: string;
  state?: string;
  createPartyType?: string;
  bankAcctIssueDate?: string;
  isHybridOffer?: string;
  defaultFlag?: string;
  billFormatName?: string;
  billingCycleTypeName?: string;
  acctId?: number;
  fingerMark?: string;
  payerNumber?: string;
  paymentMethodName?: string;
  bankId?: string;
  billAddress?: string;
  operationType?: string;
  billingCycleType?: string;
  bankAcctNbr?: string;
  stdAddrId?: string;
  updateDate?: string;
  rutNbr?: string;
  routingId?: string;
  postpaid?: string;
  bankName?: string;
  partyType?: string;
  paymentComments?: string;
  paymentType?: string;
  isLock?: string;
  bankAcctExpDate?: string;
  paymentMethodId?: number;
  mandateId?: string;
  custId?: string;
  billFormatId?: string;
  bankAcctName?: string;
  createPartyCode?: string;
  paymentTypeName?: string;
  deliverMethodName?: string;
  acctAttrValueList?: string;
  bankCardType?: string;
  acctName?: string;
  custName?: string;
  spId?: string;
  parentAcctId?: string;
  billingCycleTypeId?: number;
  createdDate?: string;
  billCurrency?: number;
  partyCode?: string;
  stateDate?: string;
  acctNbr?: string;
}

export interface ShopHeadItem {
  name: string;
  id: number;
  type: string;
  nodeId: string;
  parentCatgId?: string;
}

export interface ShopTableItem {
  indepProdSpecIdReal: number;
  offerName: string;
  salePrice: string;
  offerCatgId: number;
  priority: number;
  type: string; //"S"
  spId: number;
  indepProdSpecId: number;
  offerCatgMemId: number;
  offerType: number;
  paidFlag: "N" | "Y";
  name: string;
  offerId: number;
  indepProdSpecName: string;
  servType: number;
  id: number;
  parentCatgId: string;
  nodeId: string;
  parentCatgIdSort: number;
  seq: number;
  parentSeq?: number;
  servTypeReal: number;
  offerVerId: number;
  rentListPrice: string;
  expDate?: string;
}

export interface FeatureSelection {
  attrId: number;
  attrCode: string;
  csrVisible: "Y" | "N";
  dispOrder: number;
  spId: number;
  attrName: string;
  attrType: number;
  attrValue?: string;
}

export interface OfferCategoryMember {
  offerCatgMemId?: number;
  seq: number;
  offerId?: number;
  offerName?: string;
  offerType?: string;
  offerCode?: string;
  state?: string;
  expTimeUnit?: string;
  brandPricePlanId?: number;
  indepProdSpecId?: number;
  offerCatgName: string;
  offerCatgId: number;
  offerCatgCode?: string;
  effDate: string;
  expDate?: string;
  comments?: string;
  offerCatgType: string;
  offerVerID?: number;
  spId?: number;
  policyFlag?: string;
  pricePlanTypeLimit?: string;
  networkTypeLimit?: string;
  offerCatgClass: string;
  networkTypeName?: string;
  networkType?: string;
  dependProdSpecId?: number;
  expOff?: string;
  isPackage?: string;
  applyLevel?: string;
  warnLevel?: string;
  modelId?: number;
  isBundleFlag?: string;
  cnt: number;
  subsCnt?: number;
  method?: string;
  servType?: string;
  excludeOfferId?: number;
  pricePlanType?: string;
  prename?: string;
  lifecycleFlag?: string;
  offerExpDate?: string;
  offerEffDate?: string;
  prodType?: string;
  rowNum?: number;
}

export interface TitleCustOrder {
  spId: number;
  titleId: number;
  titleName: string;
}

export interface CertTypeCustomer {
  certTypeId: number;
  certTypeName: string;
  comments: string;
  nbrMask: string;
  maxNbrLength: string;
  minNbrLength: string;
  custType: string;
  spId: 0;
  nbrExample: number;
  custTypeName: string;
  certTypeCode: string;
}

export interface AreaCustOrder {
  areaId: number;
  parentId: number;
  areaName: string;
  comments: string;
  areaCode: string;
}

export interface AttrOrder {
  baseAttrId: number;
  attrValueId: number;
  valueMark: string;
  value: string;
  parentAttrValueId: number;
  parentAttrId: number;
  attrName: string;
}

export interface SIMCardDetail {
  orgName: string;
  comments: string;
  simCardId: number;
  hlrId: number;
  hlrName: string;
  prefix?: string;
  simState: string;
  pin1: number;
  pin2: number;
  isBindingFlag: string;
  imsi: number;
  spId: 0;
  orgId: number;
  iccid: string;
  areaId: number;
  areaName: string;
  createdDate: string;
  puk2: number;
  simTypeId: number;
  simTypeName: string;
  stateDate: string;
  staffId: number;
  ki: string;
  simStateName: string;
  puk1: number;
  accNbr?: string;
}

interface SubsNextState {
  nextStateName: string;
  nextStateDate: string;
  nextState: string;
  isIndividual: string;
}

export interface SubsListDetail {
  subsPlanName: string;
  offerName: string;
  agreementExpDate?: string;
  subsNextStateDto: SubsNextState;
  prefix: string;
  prodState: string;
  prodStateName: string;
  offerType: string;
  servTypeName: string;
  children?: string;
  parentSubs?: number;
  activeDate?: string;
  accNbr: string;
  servType: number;
  bundleMemAlias?: string;
  blockReason?: string;
  terminationReason?: string;
  terminationDate?: string;
  acctId: number;
  completedDate: string;
  subsPlanId: number;
  subsId: number;
  blockReasonCode?: string;
  offerId: number;
  acctNbr: string;
  offerVerId: number;
}

export interface ProductBase {
  updateDate: string;
  routingId?: string;
  parentOfferId?: number;
  needUpload?: string;
  prodAlias?: string;
  offerType: string;
  paramStartDate?: string;
  uploadType?: string;
  paramEndDate?: string;
  state: string;
  stateName?: string;
  offerName: string;
  spId?: string;
  completedDate: string;
  createdDate: string;
  packageFlag: string;
  agreementTimeUnit?: string;
  stateDate: string;

  parentSubsUppInstId?: number;
  servType?: string;

  // Optional fields (exist only in some objects)
  agreementExpDate?: string;
  agreementLimit?: number;
  prodExList?: string;
  prodId?: number;
  prodState?: string;
  parentProdId?: string;
  offerCode?: string;
  prodStateDate?: string;
  prodExpDate?: string;
  activeDate?: string;
  indepProdId?: string;
  agreementEffDate?: string;

  subsUppInstId?: number;
  subsUppInstExList?: string;
  expDate?: string;
  pricePlanId?: number;
  subsId?: number;
  priority?: string;
  applyLevel?: string;
  agmEffDate?: string;
  agmExpDate?: string;
  pricePlanType?: string;
  effDate?: string;

  blockReason?: string;
  paramExactDate?: string;
  subsPlanId?: number;
  offerId?: number;
  promotionItemId?: number;

  subsUppInstValueExList?: Feature[];
}

export interface AcctEx {
  updateDate: string;
  routingId: number;
  acctId: number;
  billingCycleTypeName: string;
  spId: number;
  billingCycleTypeId: number;
  paymentType: string;
  createdDate: string;
  custId: number;
  stateDate: string;
  state: string;
  acctNbr: number;
  postpaid: string;
  paymentTypeName: string;
  defaultFlag?: string;
  address?: string;
  bankAcctName?: string;
  bankId?: number;
  deliverMethod?: string;
  paymentMethodId?: number;
  billFormatId?: number;
  bankAcctNbr?: number;
  stdAddrId?: number;
}

export interface Cert {
  certNbr: number;
  certTypeId: number;
  certId: number;
  spId: number;
  effDate?: string;
  issueCountry?: string;
  operationType?: string;
  certAddress?: string;
  issueDate?: string;
  issueOrg?: string;
  expDate?: string;
}

export interface SubsUser {
  updateDate: string;
  certTypeName: string;
  routingId: number;
  gender: string;
  cert: Cert;
  partyType: string;
  religionId: number;
  custId: number;
  state: string;
  netType: string;
  certId: number;
  custName: string;
  custCode: string;
  parentId: number;
  createdDate: string;
  partyCode: string;
  custType: string;
  custCreditGradeId: number;
  stateDate: string;
  pwd: string;
  impGradeId?: number;
  thirdName?: string;
  fourName?: string;
  industryId?: number;
  occupationId?: number;
  custTitleId?: number;
  email?: string;
  secondName?: string;
  comments?: string;
  address?: string;
  spId?: number;
  zipcode?: string;
  firstName?: string;
  areaId?: number;
  phoneNumber?: string;
  birthdayDay?: string;
  stdAddrId?: number;
}

// export interface SubsUppInstEx {
//   subsUppInstId: number;
//   updateDate: string;
//   offerType: string;
//   effDate: string;
//   state: string;
//   offerName: string;
//   pricePlanId: number;
//   completedDate: string;
//   pricePlanType: string;
//   subsId: number;
//   createdDate: string;
//   applyLevel: string;
//   packageFlag: string;
//   stateDate: string;
//   routingId?: number;
//   parentOfferId?: number;
//   subsUppInstExList?: string;
//   needUpload?: string;
//   prodId?: number;
//   prodAlias?: string;
//   expDate?: string;
//   stateName?: string;
//   paramStartDate?: string;
//   parentSubsUppInstId?: number;
//   uploadType?: string;
//   servType?: string;
//   paramEndDate?: string;
//   agreementLimit?: string;
//   priority?: string;
//   spId?: number;
//   agreementTimeUnit?: string;
//   agmEffDate?: string;
//   agmExpDate?: string;
// }

export interface SubsPlan {
  subsPlanId: number;
  isBundleFlag: string;
  saleFlag: string;
  priority: string;
  spId: number;
  indepProdSpecId: number;
  eligibleFlag?: string;
  subsPlanName?: string;
  effDate?: string;
  subsPlanCode?: string;
  expDate?: string;
}

export interface SubsPlanVer {
  effDate: string;
  offerId: number;
  spId: number;
  seq: string;
  offerVerId: number;
  refOfferVerId?: number;
  state?: string;
  expDate?: string;
}

export interface SubsCust {
  updateDate: string;
  certTypeName: string;
  routingId: number;
  gender: string;
  cert: Cert;
  partyType: string;
  religionId: number;
  custId: number;
  state: string;
  netType: string;
  certId: number;
  custName: string;
  custCode: string;
  parentId: number;
  createdDate: string;
  partyCode: string;
  custType: string;
  custCreditGradeId: number;
  stateDate: string;
  pwd: string;
  impGradeId?: number;
  thirdName?: string;
  fourName?: string;
  industryId?: number;
  occupationId?: number;
  custTitleId?: number;
  email?: string;
  secondName?: string;
  comments?: string;
  address?: string;
  spId?: number;
  zipcode?: string;
  firstName?: string;
  areaId?: number;
  phoneNumber?: string;
  birthdayDay?: string;
  stdAddrId?: number;
}

export interface Offer {
  expDate?: string;
  offerType: string;
  effDate: string;
  state: string;
  comments: string;
  offerName: string;
  spId: number;
  createdDate: string;
  offerCode: string;
  offerId: number;
  stateDate: string;
  cycleQuantity?: string;
  saleListPrice?: string;
  expTimeUnit?: string;
  effType?: string;
  agreementEffType?: string;
  salePriceGstType?: string;
  timeUnit?: string;
  prodType?: string;
  rentPriceGstType?: string;
  rentListPrice?: string;
  autoContinueFlag?: string;
  duplicateFlag?: string;
  expOff?: string;
  specTime?: string;
}

export interface SubsPlanOffer {
  offerType: string;
  effDate: string;
  state: string;
  offerName: string;
  spId: number;
  createdDate: string;
  offerCode: string;
  autoContinueFlag: string;
  offerId: number;
  stateDate: string;
  cycleQuantity?: string;
  saleListPrice?: string;
  expDate?: string;
  expTimeUnit?: string;
  effType?: string;
  agreementEffType?: string;
  salePriceGstType?: string;
  timeUnit?: string;
  comments?: string;
  prodType?: string;
  rentPriceGstType?: string;
  rentListPrice?: string;
  duplicateFlag?: string;
  expOff?: string;
  specTime?: string;
}

// export interface DependProdEx {
//   updateDate: string;
//   prodId: number;
//   prodState: string;
//   offerType: string;
//   prodStateDate: string;
//   state: string;
//   offerName: string;
//   completedDate: string;
//   createdDate: string;
//   packageFlag: string;
//   offerCode: string;
//   offerId: number;
//   stateDate: string;
//   agreementExpDate?: string;
//   prodExList?: string;
//   routingId?: number;
//   parentOfferId?: number;
//   needUpload?: string;
//   prodAlias?: string;
//   paramStartDate?: string;
//   prodExpDate?: string;
//   activeDate?: string;
//   uploadType?: string;
//   indepProdId?: number;
//   paramEndDate?: string;
//   agreementLimit?: string;
//   blockReason?: string;
//   paramExactDate?: string;
//   spId?: number;
//   subsPlanId?: number;
//   agreementEffDate?: string;
//   agreementTimeUnit?: string;
//   promotionItemId?: number;
//   parentProdId?: number;
// }

export interface ProdAttrValueEx {
  attrCode: string;
  prodId: number;
  expDate?: string;
  attrType: string;
  effDate: string;
  attrId: number;
  inputType: string;
  value: string;
  attrName: string;
  key: string;
  updateDate?: string;
  routingId?: number;
  needUpload?: string;
  spId?: number;
  uploadType?: string;
}

export interface SubsBaseDetail {
  defLangId: number;
  prefix: string;
  prodNextStateDate: string;
  prodState: string;
  areaName: string;
  prodStateDate: string;
  state: string;
  acctId: number;
  prodUpdateDate: string;
  prodAttrValueExList: ProdAttrValueEx[];
  completedDate: string;
  subsPlanId: number;
  ppsPwd: string;
  offerId: number;
  parentProdId: number;
  subsPlanName: string;
  agentId: number;
  updateDate: string;
  routingId: number;
  prodStateName: string;
  prodAttrValueXML: string;
  imsi: string;
  prodId: number;
  orgId: number;
  paidFlag: string;
  custId: number;
  prodNextState: string;
  accNbr: number;
  servType: string;
  comments?: string;
  userId: number;
  spId: number;
  subsId: number;
  createdDate: string;
  areaId: number;
  packageFlag: string;
  agreementEffDate: string;
  stateDate: string;
  agreementExpDate?: string;
  certTypeName?: string;
  certTypeId?: number;
  prodExpDate?: string;
  activeDate?: string;
  indepProdId?: number;
  blockReason?: string;
  subsCatgNameList?: string;
  orgName?: string;
  certNbr?: number;
  subsSpecialGroupNameList?: string;
  blockReasonName?: string;
  offerName?: string;
  custName?: string;
  acctNbr?: number;
}

export interface SubsDetail {
  acctEx: AcctEx;
  subsUser: SubsUser;
  subsUppInstExList: ProductBase[];
  subsPlan: SubsPlan;
  subsPlanVer: SubsPlanVer;
  subsCust: SubsCust;
  subsPlanAttrXml: string;
  offer: Offer;
  subsPlanOffer: SubsPlanOffer;
  dependProdExList: ProductBase[];

  subsBaseDetail: SubsBaseDetail;
  set?: string;
  subsDefpp?: string;
  firstCall?: string;
  fellowNbrExList?: any[]; //mungkin ini fellownumber
  subsRelaExList?: any[]; //mungkin ini buat related subs
  oweFee?: string;
  subsGoodsInstExList?: any[]; //mungkin ini goods
  timer?: string;
  usedResExList?: usedResExList[]; //gktau table apa
  ccSubsExList?: string;
  postPaidFlag?: string;
  depositItemExList?: any[]; // gk tau table apa
  subsHomeZoneExList?: any[]; //mungkin ini home zone
}

export interface usedResExList {
  resNbr: string;
  createdDate: string;
  resTypeName: string;
  usedResId: number;
  resType: string;
  stateDate: string;
  state: string;
  prodId: number;
  resId: number;
  spId: 0;
}

export interface Feature {
  subsUppInstId: number;
  updateDate?: string;
  routingId?: number;
  attrCode: string;
  needUpload?: string;
  spId?: number;
  expDate?: string;
  attrType: string;
  effDate: string;
  createdDate?: string;
  attrId: number;
  uploadType?: string;
  inputType: string;
  value: string;
  attrName: string;
  createDate?: string;
}

export interface prodStateTrackBefore {
  rownum: number;
  subsEventId: number;
  newProdState: string;
  updateDate: string;
  oldProdState: string;
  eventName: string;
  oldProdStateName: string;
  newProdStateName: string;
}

export interface prodStateTrackAfter {
  nextStateName: string;
  nextStateDate: string;
  nextState: string;
  isIndividual: string;
}

export interface DefLang {
  defLangId: number;
  stdCode: string;
  defLangName: string;
  comments: string;
  i18nCode?: string;
}

export interface MasterDataOrder {
  title: TitleCustOrder[];
  certType: CertTypeCustomer[];
  areas: AreaCustOrder[];
  attr: AttrOrder[];
  industry: any[];
  occupation: any[];
  impGrade: any[];
  defLang: DefLang[];
}

export interface operationItems {
  bookingFlag?: string;
  contactChannelId: number; //1
  contactChannelName: string; //"Point of Sale";
  ctrlScript?: string; //null;
  dispOrder: number; //1;
  displayName: string; //null;
  eventName: string; //"Modify Subscriber";
  eventTypeId: number; //1;
  eventTypeName: string; //"State";
  portalIds: string; //"1021";
  relaId: number; //1;
  servType: number; //15;
  servTypeName: string; //"GSM(Convergent)";
  shortKey?: string; //null;
  spId: 0;
  subsEventId: string; //"189";
  active: boolean;
}

export interface AttrOrder extends FeatureData {
  attrValueIds?: number[];
  defaultValueMark?: string;
}

export interface StartOrderFlow {
  SERV_TYPE: string;
  CUST_ID: number;
  CREATED_DATE: Date;
  SP_ID: number;
  ACCEPT_DATE: Date;
  CUST_ORDER_ID: number;
  ROUTING_ID: number;
  OFFER_ID: string;
  POS_SALE_MODE: number;
  CONTACT_CHANNEL_ID: number;
  A_PARTY_CODE: string;
  ORDER_ITEM: OrderItem[];
  CUST: Cust;
  SUBS_EVENT_ID: number;
  CUST_CONTACT: CustContact;
  PARTY_TYPE: string;
  SEND_PROVISIONING_FLAG: string;
  CUST_ORDER_NBR: string;
  CREDIT_LIMIT_MODE: string;
  A_PARTY_TYPE: string;
  STAFF_INFO: StaffInfo;
  PARTY_CODE: string;
}

export interface Cust {
  CUST_ID: number;
  ROUTING_ID: number;
  CUST_TYPE: string;
  CUST_CODE: string;
  CERT_ID: number;
  CUST_NAME: string;
}

export interface CustContact {
  CUST_ID: number;
  CREATED_DATE: Date;
  SP_ID: number;
  PARTY_TYPE: string;
  CUST_CONTACT_ID: number;
  CONTACT_TYPE: string;
  CONTACT_CHANNEL_ID: number;
  RELA_ID: number;
  CONTACT_EVENT_ID: string;
  PARTY_CODE: string;
}

export interface OrderItem {
  SERV_TYPE: number;
  DP_OFFER_ORDER: DPOfferOrder[];
  ACCT: Acct;
  SUBS_PLAN_NAME: string;
  CUST_ORDER_ID: number;
  OFFER_ID: number;
  CONTACT_CHANNEL_ID: number;
  IS_CHECK_OWE_CHARGE: boolean;
  SUBS_EVENT_ID: number;
  ORDER_NBR: string;
  ACCT_ID: number;
  IS_RESERVE: boolean;
  ORDER_TYPE: string;
  OPERATION_TYPE: string;
  SUBS_PLAN_ID: number;
  CUST_ID: number;
  SP_ID: number;
  STATE_DATE: Date;
  ORDER_STATE: string;
  POS_SALE_MODE: number;
  PREFIX: string;
  IS_SAVED: boolean;
  POSTPAID: string;
  PROD_STATE: string;
  BLOCK_REASON: string;
  SUBS_ID: number;
  OFFER_NAME: string;
  ACC_NBR: string;
  ORDER_ITEM_ID: number;
  CUST_NAME: string;
}

export interface Acct {
  PAYMENT_METHOD_ID: number;
  CUST_ID: number;
  ROUTING_ID: number;
  ACCT_ID: number;
  STATE: string;
  BILLING_CYCLE_TYPE_ID: number;
  DELIVER_METHOD: string;
  PAYMENT_TYPE: string;
  DEFAULT_FLAG: string;
  PARTY_TYPE: string;
  ACCT_NBR: string;
  POSTPAID: string;
  PARTY_CODE: string;
}

export interface DPOfferOrder {
  SERV_TYPE: number;
  SP_ID: number;
  ABS_EFF_DATE: Date;
  OFFER_TYPE: string;
  OFFER_NAME: string;
  OFFER_ID: number;
  OPERATION_TYPE: string;
  OFFER_SEQ: string;
  OLD_EFF_DATE: Date;
  OFFER_INST_ID: number;
  ORDER_ITEM_ID: number;
}

export interface StaffInfo {
  AREA_ID: number;
  ORG_ID: number;
  STAFF_ID: number;
  STAFF_JOB_ID: number;
}

export interface OrderReason {
  orderReasonId: number;
  subsEventId: number;
  orderReasonName: string;
  comments: null;
  defaultFlag: string;
  eventName: string;
}

export interface acctAttrValueList {
  acctId: number;
  attrId: number;
  attrValue: string;
  effDate: string;
  expDate: string;
  updateDate: string;
  needUpdload: string;
  spId: number;
  routingId: number;
  operationType: string;
  attrValueMark: string;
}

// Generated by https://quicktype.io

export interface AttrCustDto {
  extMap?: EXTMap;
  valid?: boolean;
  custId?: number;
  attrId: number;
  attrValue: string;
  oldAttrValue: string;
  attrName?: string;
  needUpload?: string;
  spId: number;
  routingId?: number;
  operationType?: string;
  effDate?: string;
  expDate?: string;
  updateDate?: string;
  inputType?: string;
}

export interface EXTMap {
  additionalProp1: string;
  additionalProp2: string;
  additionalProp3: string;
}

export interface CustDetail {
  custBaseDetailDto: CustBaseDetailDto;
  bizCustDto: BizCustDto;
  custAttrValueExDtoList: CustAttrValueExDtoList[];
  custAttrValueXML: null;
  catgDtoList: null;
  custCatgNameList: null;
  custSpecialGroupDtoList: any[];
  custSpecialGroupNameList: string;
  subsExDtoList: any[];
  acctQueryResultDtoList: null;
  custEvaluateResultExDtoList: any[];
  contactManExDtoList: any[];
  parentCust: null;
  childCustList: CustBaseDetailDto[];
}

export interface BizCustDto {
  bizCustId: null;
  deliverMethod: null;
  businessType: null;
  companyRegistrationNumber: null;
  landlineNumber: null;
  registeredAddress: null;
  scale: null;
  industry: null;
  coreBusiness: null;
  fixedAssetAmount: null;
  decisionMakers: null;
  decisionMakersContact: null;
  operator: null;
  fax: null;
  spId: null;
  companyNbr: null;
  noVatReason: null;
  operationType: null;
}

export interface CustBaseDetailDto {
  custId: number;
  custCode: string;
  custName: string;
  firstName: null;
  secondName: null;
  thirdName: null;
  fourName: null;
  custType: string;
  certId: number;
  parentId: null;
  areaId: null;
  impGradeId: null;
  address: null;
  industryId: null;
  occupationId: null;
  custTitleId: null;
  email: null;
  gender: null;
  birthdayDay: null;
  phoneNumber: null;
  pwd: null;
  contactFixNbr: null;
  vatNo: null;
  custSegment: null;
  custSubSegment: null;
  doc: null;
  custAttrValueExDtoList: null;
  custTypeName: null;
  impGradeName: null;
  certTypeName: null;
  custCreditGradeName: null;
  areaName: null;
  industryName: null;
  occupationName: null;
  religionName: null;
  titleName: null;
  certTypeId: number;
  certNbr: string;
  issueOrg: null;
  issueDate: null;
  effDate: null;
  expDate: null;
  certAddress: null;
  decisionMakers: null;
  decisionMakersContact: null;
  issueCountry: null;
}

export interface CustAttrValueExDtoList {
  extMap: EXTMap;
  valid: boolean;
  custId: number;
  attrId: number;
  attrValue: string;
  needUpload?: string;
  spId: number;
  routingId?: number;
  operationType?: string;
  effDate?: string;
  expDate?: string;
  updateDate?: string;
  attrName: string;
}

export interface EXTMap {}
