interface AccumulationTriggerCreate {
  benefitValue: number | undefined;
  accountBalanceType: number;
  cycleCeilLimit: number | null;
  dailyCeilLimit: number | null;
  maximumDays: number | null;
  subscriberOnly: string | null;
  extendRule: string | null;
  resultAccountItemType: string | null;
  periodType: string | null;
  absoluteEffectiveDate: string | null;
  absoluteExpiryDate: string | null;
  offsetOfEffectiveDate: number | null;
  dayOffset: string | null;
  effUnit: string | null;
  expUnit: string | null;
  durationOfAvailability: number | null;
  relativeEffectiveTime: string | null;
  relativeExpiryTime: string | null;
  relativePeriodUnit: string | null;
  offsetOfAbsoluteExpiry: number | null;
  thresholdId: number | null;
  triggerMode: string | null;
}

interface AccumulationBenefitTriggerList {
  acmThresholdId: number;
  subBalTypeId: number;
  value: number;
  acctResId: number;
  priority: string | null;
  periodId: number;
  ceilLimit: number | null;
  dailyCeilLimit: number | null;
  floorLimit: number | null;
  dailyFloorLimit: number | null;
  periodRelUnit: string | null;
  absExpOffset: number | null;
  extendRule: string | null;
  limitSubs: string | null;
  acctResName: string | null;
  isCurrency: string | null;
  comments: string | null;
  balType: string | null;
  creditLimit: number | null;
  remindDay: number | null;
  remindValue: number | null;
  maxValue: number | null;
  absEffDate: string | null;
  absExpDate: string | null;
  relEffOffset: number | null;
  relEffUnit: string | null;
  relExpOffset: number | null;
  relExpUnit: string | null;
  relEffTime: string | null;
  relExpTime: string | null;
  dayOffset: number | null;
}

interface BalanceTriggerBenefitList {
  absEffDate: string | null;
  absExpDate: string | null;
  absExpOffset: number | null;
  acctResId: number;
  acctResName: string | null;
  balThresholdId: number;
  balType: string | null;
  ceilLimit: number | null;
  comments: string | null;
  creditLimit: number | null;
  dailyCeilLimit: number | null;
  dailyFloorLimit: number | null;
  extendRule: string | null;
  floorLimit: number | null;
  isCurrency: string | null;
  limitSubs: string | null;
  maxValue: number | null;
  maximumDays: number | null;
  periodId: number;
  periodRelUnit: string | null;
  periodType: "absolute" | "relative";
  priority: string | null;
  relEffOffset: number | null;
  relEffTime: string | null;
  relEffUnit: string | null;
  relExpOffset: number | null;
  relExpTime: string | null;
  relExpUnit: string | null;
  remindDay: number | null;
  remindValue: number | null;
  subBalTypeId: number;
  value: number;
}

interface TriggerAcmNotification {
  triggerNotification: string;
  acmThresholdId: number;
  adviceType: string;
  adviceTypeName: string;
  triggerMode: string | null;
  adviceEventId: number | null;
  adviceEventName: string | null;
  notifyParamsId: number | null;
}

interface TriggerSubsEvent {
  priority: number | null;
  comments: string;
  subsEventId: number;
  eventName: string;
  stateSet: null;
}

interface DeleteParams {
  triggerId?: number;
  thresholdId?: number;
  subBalTypeId?: number;
  subsEventId?: number;
  periodId?: number;
  adviceType?: string;
  adviceEventId?: number;
  notifyParamsId?: number;
  notifType?: number;
  triggerNotification?: string;
}
