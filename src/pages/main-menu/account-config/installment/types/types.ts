interface IInstallmentTypeList {
  instalmentTypeId: number;
  instalmentTypeName: string;
  firstPay: number;
  repeatTimes: number | null;
  comments: string | null;
  feePercents: number | null;
}
