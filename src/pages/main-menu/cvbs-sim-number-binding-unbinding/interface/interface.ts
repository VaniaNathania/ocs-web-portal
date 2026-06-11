import { Dispatch, SetStateAction } from "react";
import { menuAccess } from "../../role-management/hook/useRoleCheck";

export interface SimNumberBindUnbind {
  // accNbrWithUnbinded4SimNbrBinding: QryAccNbrWithUnbinded4SimNbrBinding[];
  // setAccNbrWithUnbinded4SimNbrBinding: Dispatch<SetStateAction<QryAccNbrWithUnbinded4SimNbrBinding[]>>;
  // accNbrEndByCount4SimNbrBinding: QryAccNbrEndByCount4SimNbrBinding[];
  // setAccNbrEndByCount4SimNbrBinding: Dispatch<SetStateAction<QryAccNbrEndByCount4SimNbrBinding[]>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  uploadBtnRef: React.RefObject<HTMLButtonElement>;
  handleUploadClick: () => void;
  handleFileChange: () => void;
  handleDownloadTemplate: () => void;
  handleRowClick: (value: BindingTempTable) => void;
  selectedItem: BindingTempTable | undefined;
  setSelectedItem: Dispatch<SetStateAction<BindingTempTable | undefined>>;
  fetchQryAccNbrWithUnbinded4SimNbrBinding: (prefix: string, accNbrBegin: string, accNbrEnd: string) => Promise<QryAccNbrWithUnbinded4SimNbrBinding[] | undefined>;
  fetchQryAccNbrWithBinded4SimNbrBinding: (prefix: string, accNbrBegin: string, accNbrEnd: string) => Promise<QryAccNbrWithBinded4SimNbrBinding[] | undefined>;
  fetchQryAccNbrEndByCount4SimNbrBinding: (prefix: string, accNbrBegin: string, accNbrQuantity: number) => Promise<QryAccNbrEndByCount4SimNbrBinding[] | undefined>;
  fetchQryAccNbrEndByCountUnbind4SimNbrBinding: (prefix: string, accNbrBegin: string, accNbrQuantity: number) => Promise<QryAccNbrEndByCount4SimNbrBinding[] | undefined>;
  fetchQrySimCardWithUnbinded: (iccidBegin: string, iccidEnd: string) => Promise<any[] | undefined>;
  fetchQryIccidEndByCount: (iccidBegin: string, accNbrQuantity: number) => Promise<IccidEndByCount[] | undefined>;
  fetchQryBindingSimNbr: (prefix: string, accNbrBegin: string, accNbrEnd: string) => Promise<BindingSimNbr | undefined>;
  fetchQrySimNbrForBinding: (prefix: string, accNbrBegin: string, accNbrEnd: string, iccidBegin: string, iccidEnd: string, matchFlag: string) => Promise<BindingSimNbr | undefined>;
  fetchQryBindingTempTableCount: (tableName: string) => Promise<BindingTempTableCount[] | undefined>;
  fetchQryBindingTempTable: (tableName: string) => Promise<BindingTempTable[] | undefined>;
  fetchUnbindingSimNbr: (onReset: () => void, tableName: string) => void;
  queryResult: BindingTempTable[];
  setQueryResult: Dispatch<SetStateAction<BindingTempTable[] | []>>;
  onSubmit: (onReset: () => void, actionType: string) => void;
  menuPrivAccess?: menuAccess
}

export interface QryAccNbrWithUnbinded4SimNbrBinding {
  prefix: string;
  accNbr: string;
}

export interface QryAccNbrWithBinded4SimNbrBinding {
  prefix: string;
  accNbr: string;
}

export interface QryAccNbrEndByCount4SimNbrBinding {
  accNbrId: number;
  prefix: string;
  accNbr: string;
  staffId: number;
  orgId: number;
  accNbrClassId: number;
  accNbrTypeId: number;
  accNbrState: string;
  hlrId: number;
  neInfo: string | null;
  areaId: number;
  nbrClassJudgeId: string | null;
  stateDate: string;
  comments: string | null;
  ppsPwd: string | null;
  preCharging: number;
  peerOperatorCode: string | null;
  npAuthCode: string | null;
  spId: null;
  isBindingFlag: string;
  partyType: null;
  partyCode: null;
}

export interface IccidEndByCount {
  simCardId: number;
  simTypeId: number;
  iccid: string;
  hlrId: number;
  imsi: string;
  pin1: string;
  puk1: string;
  pin2: string;
  puk2: string;
  ki: string;
  staffId: number;
  orgId: number;
  simState: string;
  areaId: number;
  stateDate: string;
  comments: string;
  imsi2: string | null;
  ki2: string | null;
  esn: string | null;
  injectFlag: string | null;
  adm: string | null;
  recycleFlag: string;
  checkSum: string | null;
  createdDate: string;
  k4: string | null;
  isBindingFlag: string;
  spId: number;
  partyType: string | null;
  partyCode: string | null;
}

export interface BindingSimNbr {
  iccidBegin: string | null;
  iccidEnd: string | null;
  accNbrBegin: string | null;
  accNbrEnd: string | null;
  prefix: string | null;
  matchFlag: string | null;
  fileName: string | null;
  tableName: string | null;
  spId: number | null;
  staffId: number | null;
  areaId: number | null;
  orgId: number | null;
  hlrId: number | null;
  simTypeId: number | null;
  comments: string | null;
  quantity: number | null;
  newSpId: number | null;
  simState: string | null;
  partyType: string | null;
  partyCode: string | null;
}

export interface BindingTempTableCount {
  count: number;
}

export interface BindingTempTable {
  rownum: number;
  rowno: number;
  iccid: string;
  simCardId: number;
  prefix: string;
  accNbr: string;
  bindingDate: string;
  accNbrId: number;
}
