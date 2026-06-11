export interface QryOweAcctItemListResponseDto {
  acctItemId?: number;
  acctId?: number;
  billingCycleId?: number;

  cycleBeginDate?: string; // ISO date-time
  cycleEndDate?: string; // ISO date-time

  acctItemTypeId?: number;
  acctItemTypeName?: string;

  charge?: number;

  subsId?: number;
  msisdn?: string;

  createdDate?: string; // ISO date-time

  stateName?: string;
  stateDate?: string; // ISO date-time
}

export interface SelectDepositItemResponseDto {
  depositItemId?: number;

  subsId?: number;
  depositTypeId?: number;

  voucher?: string;
  partyCode?: string;

  charge?: number;

  createdDate?: string; // ISO date-time

  comments?: string;

  submitAmount?: number;
  returnAmount?: number;

  bankId?: number;
  eventPaymentId?: number;

  checkNbr?: string;
  checkOwnerName?: string;

  checkIssueDate?: string; // ISO date-time
  checkExpDate?: string; // ISO date-time

  receiptNum?: string;

  partyType?: string;

  paymentMethodId?: number;
  spId?: number;

  depositTypeName?: string;
  paymentMethodName?: string;
  partyCodeName?: string;
}

export interface AcctBookResponseDto {
  acctBookId?: number;
  acctId?: number;

  prefix?: string;
  accNbr?: string;
  fullNumber?: string;

  scratchCardPwd?: string;

  createdDate?: string; // ISO date-time

  preCharge?: number;
  charge?: number;
  afterCharge?: number;

  expDate?: string; // ISO date-time

  paymentMethodName?: string;
  contactChannelName?: string;

  days?: number;
  seconds?: number;

  staffCode?: string;

  paymentId?: number;

  partnerSn?: string;

  reversedPaymentId?: number;
}
