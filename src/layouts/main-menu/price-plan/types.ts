interface PricePlanType {
  parentName: string;
  name: string;
  list: PricePlanList[];
}

interface PricePlanList {
  id: string;
  pricePlanTypeName: string;
}
