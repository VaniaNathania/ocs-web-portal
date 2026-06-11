export interface HisBillByCount {
  billId: number;
  billNbr: string;
  acctId: number;
  billingCycleId: number;
  preBalance: number;
  due: number;
  disputeCharge: number;
  recvCharge: number;
  pastAdjustCharge: number | null;
  adjustCharge: number;
  chargeBeAdjusted: number | null;
  spId: number | null;
  billCode: string | null;
  chargeBeReversed: number | null;
  billExDto: string | null;
  routingId: number | null;
  writeoffCharge: number | null;
  billingCycleName: string;
  settCharge: number | null;
  operationType: string | null;
}

export interface BillAcctItemProps {
  billId: number;
  billNbr: string;
  acctId: number;
  billingCycleId: number;
  preBalance: number;
  due: number;
  disputeCharge: number;
  recvCharge: number;
  pastAdjustCharge: number | null;
  adjustCharge: number;
  chargeBeAdjusted: number | null;
  spId: number | null;
  billCode: number | null;
  chargeBeReversed: number | null;
  billExDto: string | null;
  routingId: number | null;
  writeoffCharge: number | null;
  billingCycleName: string;
  settCharge: number;
  operationType: string | null;
  acctItemList: AcctItemList[];
}

export interface AcctItemList {
  acctItemId: number;
  billingCycleId: number;
  acctId: number;
  subsId: number;
  acctItemTypeId: number;
  charge: number;
  basicCharge: number | null;
  createdDate: Date;
  state: string;
  stateDate: Date;
  balId: number | null;
  settleCharge: number | null;
  spId: number | null;
  acctBookId: number | null;
  billId: number | null;
  batchId: number | null;
  instalmentPartialSettleAmount: number | null;
  overduePlanId: number | null;
  instalmentTypeId: number | null;
  overdueDay: number | null;
  bindAcctItemTypeId: number | null;
  acctItemTypeName: string;
  cycleBeginDate: string | null;
  cycleEndDate: string | null;
  totalAmount: number | null;
  firstCycleOverdue: number | null;
  sumOfOverdue: number | null;
  gstSeq: number;
}
