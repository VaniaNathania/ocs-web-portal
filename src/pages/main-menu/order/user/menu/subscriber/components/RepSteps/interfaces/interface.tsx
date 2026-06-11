import { SIMCardDetail } from "@/pages/main-menu/order/models/interfaces";

export interface ReplacementData {
  newSIMCard: SIMCardDetail;
  susPensionReasonId?: number;
  otherReason?: string;
  remarks?: string;
}
