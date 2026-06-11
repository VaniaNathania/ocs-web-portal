interface ThresholdAcmList {
  acmThresholdId: number;
  triggerId: number;
  value: number | null;
  interval: number | null;
  reAttr: number | null;
  reAttrName: string | null;
  ratio: number | null;
  touchPcrf: number | null;
  triggerMode: string | null;
  acmBilShockRuleId: number | null;
  ruleName: string | null;
  offAttr: number | null;
}

interface FeatureAcmList {
  attrCatg: string | null;
  comments: string | null;
  attrName: string | null;
  dependProdSpecId: number | null;
  reAttrName: string | null;
  reAttr: number | null;
  reType: string | null;
  measurable: string | null;
  dynAttrId: number | null;
  reTypeName: string | null;
}

interface AdvancedRules {
  triggerId: number;
  effDate: string;
  expDate: string;
  offerVerId: number;
  spId: number;
  scriptPage: string | null;
  scriptTempletId: number | null;
  ruleScript: string | null;
}

interface ZoneMap {
  zoneMapId: number;
  zoneMapName: string;
  zoneId: number;
  zoneName: string;
  zoneCode: string;
  parentZoneId: number;
}
