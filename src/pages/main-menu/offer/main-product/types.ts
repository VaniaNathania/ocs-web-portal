export interface PricePlaneProps {
  offerId: number;
  offerVerId: number;
  pricePlanName: string;
  pricePlanType: string;
  pricePlanCode: string;
  validPeriod: string;
  applyLevel: string;
}

export interface PricePlanDetail {
  offerId: number;
  pricePlanName: string;
  pricePlanCode: string;
  pricePlanType: string;
  effDate: string | null;
  expDate: string | null;
  applyLevel: string;
  offerVerList: OfferVersion[];
}

export interface OfferVersion {
  offerVerId: number;
  effDate: string | null;
  expDate: string | null;
}
