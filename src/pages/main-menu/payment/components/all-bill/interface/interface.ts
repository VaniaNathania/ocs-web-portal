export interface AllBillProps {
  billId: number;
  billNbr: string;
  acctId: number | null;
  billingCycleId: number | null;
  preBalance: string | null;
  due: number;
  disputeCharge: string | null;
  recvCharge: string | null;
  pastAdjustCharge: string | null;
  adjustCharge: number;
  chargeBeAdjusted: string | null;
  spId: number | null;
  billCode: string | null;
  chargeBeReversed: string | null;
  billExDto: string | null;
  routingId: number | null;
  writeoffCharge: string | null;
  billingCycleName: string;
  settCharge: number;
  operationType: string | null;
}
