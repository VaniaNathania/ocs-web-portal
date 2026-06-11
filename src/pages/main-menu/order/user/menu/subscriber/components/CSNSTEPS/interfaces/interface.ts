import { OrderReason } from "@/pages/main-menu/order/models/interfaces";
import { BillCycleType } from "../../../../accInfo/models/interfaces";

export interface ChangeSubsProfData {
  susPensionReasonId?: number;
  otherReason: string;
  userTypeId?: number;
  language?: number;
}

export interface MasterData {
  billingCycleType: BillCycleType[];
  orderReason: OrderReason[];
}
