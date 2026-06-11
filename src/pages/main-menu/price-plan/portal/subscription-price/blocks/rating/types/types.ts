interface DetailMappingZone {
  ratePlanZoneId: number;
  ratePlanId: number;
  mappingSrcType: string | null;
  mappingSrcValue: string | null;
  mappingDesType: string | null;
  mappingDesValue: string | null;
  priority: number;
  labelShow: string;
  reAttrName: string | null;
  zoneMapName: string | null;
  mappingId: number;
  mappingName: string | null;
  mappingMatchType: string | null;
  mappingType: string | null;
  mappingValue: string | null;
}

interface MappingDetail {
  mappingId: number;
  mappingName: string;
  priority: number;
}
