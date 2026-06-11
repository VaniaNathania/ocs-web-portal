export interface SubsPlanOfferAttrValueList {
  subsPlanOfferAttrId: number;
  attrValueId: number;
  spId: number;
}

export interface SubsPlanOfferAttrList {
  subsPlanOfferAttrId: number;
  offerId: number;
  attrId: number;
  defaultValue: string;
  attrValueIds: number[];
  excludeFlag: string;
  mask: string;
  exceptionMessage: string;
  subsPlanOfferAttrValueList: SubsPlanOfferAttrValueList[];
  offerVerId: number;
  spId: number;
}

export interface FeatureModData {
  showPage: boolean;
  subsPlanVerId: number;
  subsPlanId: number;
  offerId: number;
  subsPlanOfferAttrList: SubsPlanOfferAttrList[];
  spId: number;
  offerVerId: number;
}
