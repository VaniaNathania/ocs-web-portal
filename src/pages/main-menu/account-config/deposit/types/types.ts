interface IDepositList {
  depositTypeId: number;
  name: string;
  comments: string | null;
  charge: number;
  spId: number;
  depositTypeCode: string | null;
  refundable: "Y" | "N";
  transCredit: "Y" | "N";
  checkDuration: number | null;
}
