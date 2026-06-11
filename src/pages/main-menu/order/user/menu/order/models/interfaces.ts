export interface OrderList {
  orderItemId: number;
  orderNbr: string;
  offerName: string;
  subsPlanName?: string;
  offerId: number;
  subsEventId: number;
  eventName: string;
  offerType: string;
  custOrderId: number;
  accNbr: string;
  orderState: string;
  orderStateName: string;
  createdMan: string;
  acceptChannelName: string;
  createdDate: string;
  completedDate: string;
  contactChannelId: number;
  contactChannelName: string;
  children?: any;
  orderType: string;
  bundleMemAlias?: null;
  routingId?: number;
  timerEventId?: number;
}

export type orderState = "I,P,B,S,G,C,T,E,J,W" | "I,P,B,S,G" | "C" | "T" | "E";

export interface OrderQuery {
  custOrderId?: null;
  startDate?: string | null;
  offerName?: string | null;
  endDate?: null;
  subsEventId?: number | null;
  contactChannelId?: null;
  orderNbr?: number | null;
  orgId?: number | null;
  accNbr?: string | null;
  subsId?: null;
  state?: orderState;
}

//detail order
export interface OrderDetail {
  orderSubjectDto: OrderSubjectDto;
  orderBaseItemDtoList: OrderBaseItemDtoList[];
  orderDpOfferDtoList: any[];
  orderFellowNbrDtoList: any[];
  orderHomeZoneDtoList: any[];
  orderGoodsDtoList: any[];
  orderCreditLimitDtoList: any[];
  orderResDtoList: any[];
  orderFeeRespDto: OrderFeeRespDto;
  orderAllRelaDto: any[];
  orderCDRPrintDto: any;
}

export interface OrderBaseItemDtoList {
  name: string;
  value: string;
  oldValue: null;
  operationType: string;
  operationTypeName: string;
  dataType: null;
  inputType: null;
}

export interface OrderFeeRespDto {
  orderFeeSubjectRespDto: OrderFeeSubjectRespDto;
  orderFeeDetailRespDtoList: OrderFeeDetailRespDtoList[];
}

export interface OrderFeeSubjectRespDto {
  acctNbr: string;
  firstPay: string;
  instalmentTypeName: null;
  receivableCharge: number;
  promotionCharge: number;
  receivedCharge: number;
  paymentMethodId: number;
  paymentMethodName: number;
  checkNbr: null;
  payPlan: null;
  comments: null;
}

export interface OrderSubjectDto {
  accNbr: string;
  custOrderNbr: null;
  orderNbr: number;
  contactChannelId: number;
  contactChannelName: string;
  acceptDate: string;
  stateDate: string;
  subsEventId: number;
  subsEventName: string;
  orderState: string;
  partyType: null;
  partyCode: null;
  partyName: null;
  certId: number;
  certNbr: string;
  custName: string;
  custTypeName: string;
  comments?: string;
  offerName: string;
  subsPlanName: string;
  certTypeName: string;
  orderType: string;
  custId: null;
  relAgmUnit: null;
  relAgmOffset: null;
  agmEffDate?: string;
  oldAgmEffDate?: string;
  apartyName: string;
  apartyCode: string;
  apartyType: string;
}

export interface OrderFeeDetailRespDtoList {
  feeItemId: string;
  promotionCharge: string;
  acctResName: string;
  acctResId: string;
  isCurrency: string;
  promitionDetailList: string;
  receivableCharge: string;
  receivedCharge: string;
  feeItemName: string;
}
