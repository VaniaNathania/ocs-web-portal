interface TriggerBalanceNotification {
  triggerNotification: string;
  balThresholdId: number;
  adviceType: string;
  adviceTypeName: string;
  triggerMode: string | null;
  adviceEventId: number | null;
  adviceEventName: string | null;
  notifyParamsId: number | null;
}
