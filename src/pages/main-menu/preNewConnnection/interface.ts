import { AreaDetailProps } from "../change-number-profile/hooks/ChangeNumberProfileContext";
import { TimeUnit } from "../data-reference/ratable-event-action/hooks/RatableEventActionContext";
import { OrgData } from "../upload-simcard/blocks/Organization";
import { TreeNodeMain } from "./blocks/BuildTreeMain";

export interface formPreNew {
  actionType?: string;
  operationType: string;
  resourceType: string;
  searchType?: string;
  showDialog: boolean;
  // search: string;
  selectItems: ModSubsGridRow[];
  productAlias: Record<string, string>;
  timeUnit: Record<string, string>;
  effectiveDuration: Record<string, string>;
  effectiveType: Record<string, string>;
  detailValue: Record<string, SubsPlanAttrFiji>;
  expandedRows: number[];
  subsPlanAttrFijiDialog: SubsPlanAttrFiji[];
  subsPlanAttrFijiRow: Record<number, SubsPlanAttrFiji[]>;
  clientKeyToOfferId: Record<string, number>;
  vasPnFijiDatas: VasPnFijiProps[];
  timeUnitDatas: TimeUnit[];
  subsPlanId?: number;
  getSubsPlanName: string;
  isVasPnFijiLoading: boolean;
  selectedItemStep3: queryTempTable | undefined;
  selectedPrefix: string;
  isLoading: boolean;
  tempTableName: string | undefined;
  uploadResponse: UploadResponse | undefined;
  batchDealFiles: BatchDealFilesProps | undefined;
  tempTable: queryTempTable[];
  statusResp: StatusProps | undefined;
  uploadFiles: UploadFilesState | undefined;
  selectedOrgId: number | undefined;
  selectedAreaId: number | undefined;
  selectedDefLangId: number | undefined;
  areaDetail: AreaDetailProps[];
  orgData: OrgData[];
  defLanguage: DefLangProps[];
  remarks: string | null;
  reqDate: string;
  selectedItemDialog: TreeNodeMain | null;
  isSuccess: boolean;
  isConfirm: boolean;
  isCancel: boolean;
  bathcByRangeResp: batchByRangeRespProps | undefined;
  accNbrBegin: string | undefined;
  accNbrEnd: string | undefined;
  quantityAccNbrResp: number | undefined;
  quantityIccidResp: number | undefined;
  iccidBegin: string | undefined;
  iccidEnd: string | undefined;
  searchQuantity: number | undefined;
  custId: number | undefined;
  custName: string | undefined;
  hvcCustomer: "Y" | "N" ;
  dataRegulerFlag: "Y" | "N";
}

export interface batchByRangeRespProps {}

export interface ResourceTypeProps {
  label?: string;
  key?: string;
}

export interface queryTempTable {
  rownum: string;
  rowno: string;
  iccid: string;
  simCardId: number;
  prefix: string;
  accNbr: string;
  accNbrId: number;
}

export interface effectiveDurationValue {
  duration: string;
  timeUnit: string;
}

export interface OfferCatalogAllProps {
  name?: string;
  id?: number;
  parentCatgId?: string;
  type?: string;
  nodeId?: string;
}

export interface OfferAndSubsPlanByOfferCatgProps {
  type: string;
  id: number;
  priority: number;
  name: string;
  mainName: string;
  nodeId: string;
  parentCatgId: string;
  offerType: string;
  salePrice: string | null;
  rentListPrice: string | null;
  cycleQuantity: string | null;
  timeUnit: string | null;
  expDate: string | null;
  indepProdSpecId: number;
  indepProdSpecName: string;
  servType: string;
  offerVerId: number;
  paidFlag: string;
  comments: string | null;
  __level?: number;
}

export interface VasPnFijiProps {
  offerGroupId: number | null;
  offerGroupName: null | string;
  offerGroupType: null | string;
  groupType: null | string;
  upperLimit: null;
  lowerLimit: null;
  necessary: null | string;
  offerGroupMemId: number | null;
  offerId: number | null;
  offerName: null | string;
  offerType: null | string;
  offerCode: null | string;
  servType: null;
  agreementPeriod: null | string;
  timeUnit: null | string;
  seq: number;
  defaultFlag: null | string;
  parentId: number | null;
  parentOfferGroupId: number | null;
  parentOfferPagId: null | number;
  name: string;
  id: number;
  modelId: null | number;
  stockType: null | string;
  isDummyEsn: null | string;
  duplicateFlag: null | string;
  offerDto: OfferDto | null;
  children: VasPnFijiProps[] | null;
  expOff: null | string;
  expTimeUnit: null | string;
  relAgmUnit: null | string;
  relAgmOffset: null | string;
  defaultPricePlan: boolean;
  effType: null | string;
  relExpOffset: null | string;
  relExpUnit: null | string;
  __isDuplicate?: string;
  __clientKey?: string;
  __parentId?: number;
  __oriClientKey?: string;
}

export interface OfferDto {
  offerId: number;
  offerType: string;
  offerName: string;
  comments: null | string;
  offerCode: string;
  saleListPrice: null | number;
  rentListPrice: null | number;
  effDate: null | string;
  expDate: null | string;
  createdDate: null | string;
  state: string;
  stateDate: null | string;
  effType: string;
  specTime: null | string;
  autoContinueFlag: string;
  cycleQuantity: null | string;
  timeUnit: null | string;
  duplicateFlag: null | string;
  spId: number;
  expOff: null | string;
  expTimeUnit: null | string;
  agreementEffType: null | string;
  salePriceGstType: null | string;
  rentPriceGstType: null | string;
  prodType: null | string;
  childOfferGroupId: null | number;
  defaultEffType: string;
}

export type ModSubsGridRow =
  | (VasPnFijiProps & {
      __rowType: "PARENT";
      __level: 0;
      __hasChildren: boolean;
      __clientKey: string;
    })
  | (VasPnFijiProps & {
      __rowType: "CHILD";
      __level: 1;
      __parentId: number;
      __clientKey: string;
    });

export interface SubsPlanAttrFiji {
  attrId: number;
  attrName: string;
  attrCode: string;
  defaultValue: string;
  objAttrId: number;
  attrValueIds: number;
  attrValues: string;
  nullable: string;
  inputType: string;
  instantiatable: string;
  defaultValueMark: string;
  custId: number;
  attrValueList: [
    {
      baseAttrId: number;
      attrValueId: number;
      valueMark: string;
      value: string;
      parentAttrValueId: number;
      parentAttrId: number;
      spId: number;
      seq: number;
    },
  ];
}

export interface fetchQrySubsPlanAttrFijiParams {
  mode: "fromDialog" | "fromRow";
  subsPlanId: number;
  offerId: number;
}

export type FileType = "ICCID" | "SERVICENUMBER";
export type UploadFileState = {
  files: File[];
  fileNames: string[];
};
export type UploadFilesState = Record<FileType, UploadFileState>;

export interface BatchPreNewConnectionProps {
  prefix: string;
  hasGmGoods: boolean;
  banding: boolean;
  accordAccNbr: boolean;
  accNbrBegin: string;
  accNbrEnd: string;
  iccidBegin: string;
  iccidEnd: string;
  modelId: number;
  seqNbrBegin: string;
  seqNbrEnd: string;
  tableName: string;
  accNbrOrgId: number;
  iccidOrgId: number;
  seqNbrOrgId: number;
  wholesaleDto: WholesaleDto;
  servType: string;
  spId: number;
  subsEventId: number;
}

export interface WholesaleDto {
  wholesaleId: number;
  subsEventId: number;
  orgId: number;
  reqDate: string;
  createdDate: string;
  comments: string;
  commisionAmount: number;
  wholesaleCode: string;
  invoiceNo: string;
  startNbr: string;
  endNbr: string;
  offerId: number;
  partyType: string;
  partyCode: string;
  priority: number;
  state: string;
  spId: number;
  subsPlanId: number;
  extAttr: EXTAttr;
  prefix: string;
  custId: number;
  contactChannelId: number;
  custOrderId: number;
}

export interface EXTAttr {
  areaId: number;
  isFile: string;
  defLangId: number;
  custId: string;
  dpOfferList: DPOfferList[];
  pricePlanId: number[];
  dependProdSpecId: number[];
  indepProdAttrList: IndepProdAttrList[];
  dpOfferAttrList: DPOfferAttrList[];
}

export interface DPOfferAttrList {
  offerId: number;
  attrId: number;
  value: string;
  oldValue: string;
  operationType: string;
}

export interface DPOfferList {
  offerId: number;
  offerType: string;
  offerName: string;
  comments: string;
  offerCode: string;
  saleListPrice: number;
  rentListPrice: number;
  effDate: string;
  expDate: string;
  createdDate: string;
  state: string;
  stateDate: string;
  effType: string;
  specTime: string;
  autoContinueFlag: string;
  cycleQuantity: number;
  timeUnit: string;
  duplicateFlag: string;
  spId: number;
  expOff: number;
  expTimeUnit: string;
  agreementEffType: string;
  salePriceGstType: string;
  rentPriceGstType: string;
  prodType: string;
  childOfferGroupId: number;
  servType: number;
  isPackage: string;
  networkType: string;
  subsOfferDtos: string[];
  offerInstId: number;
  relEffOffset: number;
  relEffUnit: string;
  absEffDate: string;
  relExpOffset: number;
  relExpUnit: string;
  absExpDate: string;
  operationType: string;
  agmExpDate: string;
  oldAgmExpDate: string;
  dpOfferAttrList: DPOfferAttrList[];
  isNeedQryFee: string;
  isCalRatingFee: string;
  rental: string;
  chargeFlag: string;
  relAgmUnit: string;
  relAgmOffset: number;
  defaultEffType: string;
}

export interface IndepProdAttrList {
  attrId: number;
  value: string;
  oldValue: string;
  operationType: string;
  effDate: string;
  expDate: string;
}

export interface DefLangProps {
  defLangId: number;
  defLangName: string;
}

export interface searchResultProps {
  id: number;
  name: string;
  __clientKey: string;
  parentId?: number;
  nameLower: string;
}

export interface UploadResponse {
  fileName: string;
  filePath: string;
  originalName: string;
}

export interface BatchDealFilesProps {
  logFileName: string;
  lineDefine: string;
  isPotDubbo: string;
  withFile: string;
  filesPrimaryKey: string;
  batch: string;
  count: string;
  fileKey: string;
  cls: string;
  type: string;
  serviceName: string;
  separator: string;
  withHead: string;
  exitWithException: string;
  id: string;
  filesTypes: null;
  arg: Arg;
  files: FileProps[];
  success: boolean;
  sinorita_fish__flag: string;
  callServiceSuccess: string;
  isLogged1220: string;
}

export interface Arg {
  accNbrFiles: [];
  isFile: string;
  hasGmGoods: string;
  accordAccNbr: string;
  banding: string;
  servType: string;
  offerIds: string;
  hasIccid: string;
  orgId: string;
  fileType: string;
  tableName: string;
}

export interface FileProps {
  fileName: string;
  lineDefine: string;
  filePath: string;
  fileKey: string;
  separator: string;
  withHead: string;
}

// export interface StatusProps {
//   batchId: string;
//   status: string;
//   totalRows: number;
//   successRows: number;
//   failedRows: number;
//   progress: string;
//   startTime: string;
//   endTime: string;
//   errorMessage: string;
//   failedDetails: FailedDetail[];
// }

// export interface FailedDetail {
//   rowNumber: number;
//   accNbr: string;
//   reason: string;
// }

export interface StatusProps {
  status: number;
  message: string;
  data: Data;
}

export interface Data {
  batchId: string;
  status: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  progress: string;
  startTime: string;
  endTime: string;
  errorMessage: string;
  failedDetails: FailedDetail[];
}

export interface FailedDetail {
  rowNumber: number;
  accNbr: string;
  reason: string;
}

export interface BatchPreNewConnectionProps {
  prefix: string;
  hasGmGoods: boolean;
  banding: boolean;
  accordAccNbr: boolean;
  accNbrBegin: string;
  accNbrEnd: string;
  iccidBegin: string;
  iccidEnd: string;
  modelId: number;
  seqNbrBegin: string;
  seqNbrEnd: string;
  tableName: string;
  accNbrOrgId: number;
  iccidOrgId: number;
  seqNbrOrgId: number;
  wholesaleDto: WholesaleDto;
  servType: string;
  spId: number;
  subsEventId: number;
}

export interface WholesaleDto {
  wholesaleId: number;
  subsEventId: number;
  orgId: number;
  reqDate: string;
  createdDate: string;
  comments: string;
  commisionAmount: number;
  wholesaleCode: string;
  invoiceNo: string;
  startNbr: string;
  endNbr: string;
  offerId: number;
  partyType: string;
  partyCode: string;
  priority: number;
  state: string;
  spId: number;
  subsPlanId: number;
  extAttr: EXTAttr;
  extAttrXml: null;
  prefix: string;
  custId: number;
  contactChannelId: number;
  custOrderId: number;
}

export interface EXTAttr {
  areaId: number;
  isFile: string;
  defLangId: number;
  custId: string;
  dpOfferList: DPOfferList[];
  pricePlanId: number[];
  dependProdSpecId: number[];
  indepProdAttrList: IndepProdAttrList[];
  dpOfferAttrList: DPOfferAttrList[];
}

export interface DPOfferList {
  offerId: number;
  offerType: string;
  offerName: string;
  comments: string;
  offerCode: string;
  saleListPrice: number;
  rentListPrice: number;
  effDate: string;
  expDate: string;
  createdDate: string;
  state: string;
  stateDate: string;
  effType: string;
  specTime: string;
  autoContinueFlag: string;
  cycleQuantity: number;
  timeUnit: string;
  duplicateFlag: string;
  spId: number;
  expOff: number;
  expTimeUnit: string;
  agreementEffType: string;
  salePriceGstType: string;
  rentPriceGstType: string;
  prodType: string;
  childOfferGroupId: number;
  servType: number;
  isPackage: string;
  networkType: string;
  subsOfferDtos: string[];
  offerInstId: number;
  relEffOffset: number;
  relEffUnit: string;
  absEffDate: string;
  relExpOffset: number;
  relExpUnit: string;
  absExpDate: string;
  operationType: string;
  agmExpDate: string;
  oldAgmExpDate: string;
  dpOfferAttrList: DPOfferAttrList[];
  isNeedQryFee: string;
  isCalRatingFee: string;
  rental: string;
  chargeFlag: string;
  relAgmUnit: string;
  relAgmOffset: number;
  defaultEffType: string;
}
