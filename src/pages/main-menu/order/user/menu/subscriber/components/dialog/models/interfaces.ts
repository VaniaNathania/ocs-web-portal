import { ProdAttrValueEx } from "@/pages/main-menu/order/models/interfaces";

export interface SubsBaseDetail {
  subsCatgNameList: string;
  subsSpecialGroupNameList: string;
  servType: number;
  paidFlag: string;
  extMap: EXTMap;
  subsId: number;
  prefix: string;
  accNbr: string;
  custId: number;
  custType: string;
  userId: number;
  agentId: number;
  orgId: number;
  orgName: string;
  areaId: number;
  areaName: string;
  updateDate: string;
  routingId: number;
  defLangId: number;
  ppsPwd: string;
  comments: string;
  spId: number;
  acctId: number;
  acctNbr: string;
  prodId: number;
  offerId: number;
  offerName: string;
  completedDate: string;
  activeDate: string;
  prodState: string;
  prodStateName: string;
  subsPlanId: number;
  packageFlag: string;
  parentProdId: number;
  indepProdId: number;
  prodStateDate: string;
  prodUpdateDate: string;
  createdDate: string;
  state: string;
  stateDate: string;
  blockReason: string;
  blockReasonName: string;
  prodExpDate: string;
  agreementEffDate: string;
  agreementExpDate: string;
  prodAttrValueExDtoList?: ProdAttrValueEx[];
  prodAttrValueXML: string;
  subsPlanName: string;
  custName: string;
  certNbr: string;
  certTypeId: number;
  certTypeName: string;
  imsi: string;
  subsNextStateDto?: SubsNextStateDto;
  postPaid: string;
  billingCycleTypeName: string;
}

export interface EXTMap {}

export interface SubsNextStateDto {
  nextState: string;
  nextStateName: string;
  nextStateDate: string;
  isIndividual: boolean;
}

export interface RelationSubsList {
  extMap: EXTMap;
  valid: boolean;
  subsRelaAttrValueList: any[];
  subsRelaId: number;
  subsId: number;
  bindType: string;
  parentSubsId: number;
  createdDate: string;
  state: string;
  stateDate: string;
  relaEffDate: string;
  relaExpDate: string;
  updateDate: string;
  spId: number;
  rowno: any[];
  subsRelaAttrValueExDtoList: SubsRelaAttrValueExDtoList[];
  sourcePrefix: string;
  sourceAccNbr: string;
  relaPrefix: string;
  relaAccNbr: string;
  prodState: string;
  prodStateName: string;
  bindTypeName: string;
  comments: string;
  vpnName: string;
  cgName: string;
  cgSubsId: number;
  cgSubsRelaId: number;
}

export interface SubsRelaAttrValueExDtoList {
  subsRelaId: number;
  attrId: number;
  value: string;
  effDate: string;
  expDate: string;
  attrName: string;
  attrCode: string;
  inputType: string;
  defaultValue: string;
}
