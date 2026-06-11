interface RecurringEvents {
  reId: number;
  offerVerId: number;
  reName: string;
}

interface EventMenuRecurringList {
  recurringReType: string;
  recurringReTypeName: string;
}

interface CreateRatePlan {
  offerVerId: number;
  reId: number;
  ratePlanName: string;
  ratePlanCode: string;
  remarks: string | null;
  ratePlanType: string;
  templateFlag: string;
  catalogId: number | null;
  spId: number;
  ratePlanZones: RatePlanZone[] | null;
}

interface EventFeature {
  priority: number;
  mappingSrcType: string;
  mappingSrcValue: string;
  mappingDesValue: string;
  mappingDesType: string;
  labelShow: string;
}

interface DetailItem {
  priority: number;
  mappingSrcType: string;
  mappingSrcValue: string;
  mappingDesValue: string;
  mappingDesType: string;
  labelShow: string;
}
