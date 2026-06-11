import { paging } from "@/pages/main-menu/role-management/generalUseComp";

export interface orderInfo {
  orderType: string;
  subsPlanName: string;
  orderNbr: string;
  offerName: string;

  routingId?: number;
  orderItemId?: number;

  completedDate: string;
  orderState: string;

  contactChannelId?: number;

  offerType: string;

  subsEventId?: number;

  createdMan: string;
  contactChannelName: string;
  createdDate: string;

  children?: string;

  acceptChannelName?: string;

  eventName: string;

  offerId?: number;

  accNbr: string;
  bundleMemAlias?: string;

  custOrderId?: number;

  orderStateName: string;
}

export interface orderState {
  comments?: string;
  orderState: string;
  orderStateName: string;
}

export interface orderSubsEvent {
  subsEventId: string;
  comments?: string;
  eventName: string;
  priority?: string;
}

export interface orderQuery extends paging {
  orderNbr?: string;
}
