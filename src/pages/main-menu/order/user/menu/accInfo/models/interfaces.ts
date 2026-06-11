export interface BillCycleType {
  billingCycleTypeId: number;
  timeUnit: string;
  billingCycleTypeName: string;
  comments: null;
  quantity: number;
  beginDate: Date;
  debtDate: Date;
  timeUnitName: string;
  operator: null;
  billingCycleTypeCode: string;
  runDate: null;
  prodType: null;
  postpaid: string;
  custType: null;
  custTypeName: null;
}

export interface DeliverMethod {
  deliverMethod: string;
  comments: string;
  deliverMethodName: string;
}

export interface PaymentMethod {
  comments: string;
  paymentMethodId: number;
  paymentTypeName: string;
  paymentMethodName: string;
  paymentType: string;
}

export interface BillCurency {
  stdCode: string;
  balType: string;
  refillable: string;
  acctResName: string;
  acctResId: number;
  isCurrency: string;
}

export interface FileFormat {
  value: string;
  lookupName: string;
  tableName: string;
  columnName: string;
}

export interface MasterAccForm {
  billCycleType: BillCycleType[];
  deliveryMethod: DeliverMethod[];
  paymentMethod: PaymentMethod[];
  billCurency: BillCurency[];
  fileFormat: FileFormat[];
}

export interface ContactChannel {
  spId: null;
  contactChannelId: number;
  comments: string;
  contactChannelCode: null;
  systemReserve: null;
  channelType: number;
  contactChannelName: string;
}

export interface PaymentHistoryQuery {
  acctNbr?: string;
  paymentMethodId?: number;
  acctId?: number;
  paymentId?: number;
  contactChannelId?: number;
  tradeBeginTime?: string;
  tradeEndTime?: string;
  pageNumber: number;
  pageSize: number;
}

export interface PaymentHistoryList {
  acctBookId: number;
  acctId: number;
  prefix: string;
  accNbr: string;
  fullNumber: string;
  scratchCardPwd: string;
  voucher: string;
  bankCode: string;
  createdDate: string;
  preCharge: number;
  charge: number;
  afterCharge: number;
  preExpDate: string;
  expDate: string;
  paymentMethodName: string;
  contactChannelName: string;
  days: number;
  seconds: number;
  userCode: string;
  paymentId: number;
  partnerSn: string;
  reversedPaymentId: number;
  refundReason: string;
  postpaid: string;
  spName: string;
  userName: string;
  partyType: string;
  acctNbr2: string;
  cardTypeName: string;
}
