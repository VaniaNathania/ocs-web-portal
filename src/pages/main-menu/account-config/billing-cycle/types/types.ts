interface BillingCycleTypeList {
  billingCycleTypeId: number;
  timeUnit: string;
  billingCycleTypeName: string;
  comments: string | null;
  quantity: number;
  beginDate: string;
  debtDate: string;
  operator: string | null;
  billingCycleTypeCode: string | null;
  runDate: string | null;
  prodType: string | null;
  postpaid: string;
  custType: string | null;
  sp: number | null;
}

interface BillingCycleTypePayload {
  timeUnit: string;
  billingCycleTypeName: string;
  comments: string | null;
  quantity: number;
  beginDate: string;
  debtDate: string;
  operator: string | null;
  billingCycleTypeCode: string | null;
  runDate: string | null;
  prodType: string | null;
  postpaid?: string;
  custType: string | null;
  spId: number;
}

interface BillingCycleList {
  billingCycleId: number;
  billingCycleTypeId: number;
  cycleBeginDate: string;
  cycleEndDate: string;
  state: string;
  stateFlag: string;
  debtDate: string;
  runDate: string;
  documentDate: string;
  postingDate: string;
  invoiceDate: string;
  originDate: string;
  notificationDate: string;
}

interface BillingCyclePayload {
  billingCycleTypeId: number;
  beginDate: string;
  spId: number;
  quantity: number;
  runDate: string;
  timeUnit: string;
}
interface BillingCycleUpdatePayload {
  billingCycleTypeId: number;
  billingCycleId: number;
  state: string | null;
  cycleBeginDate: string;
  cycleEndDate: string;
  debtDate: string;
  runDate: string | null;
  originDate: string | null;
  documentDate: string | null;
  postingDate: string | null;
  invoiceDate: string | null;
  spId: number;
  notificationDate: string | null;
}
