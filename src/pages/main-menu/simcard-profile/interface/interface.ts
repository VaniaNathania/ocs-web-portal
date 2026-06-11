import { Dispatch, SetStateAction } from "react";
import { menuAccess } from "../../role-management/hook/useRoleCheck";
import { AreaDetailProps } from "../../change-number-profile/hooks/ChangeNumberProfileContext";
import { PrimaryNeProps, SimTypeProps } from "../../upload-simcard/hooks/UploadSimCardContext";

export type mode = "view" | "edit";

export interface ContextProps {
  menuPrivAccess: menuAccess;
  selectedRow: DatasProps | undefined;
  setSelectedRow: Dispatch<SetStateAction<DatasProps | undefined>>;
  mode: mode;
  setMode: Dispatch<SetStateAction<mode>>;
  areaDetail: AreaDetailProps[];
  primaryNe: PrimaryNeProps[];
  simType: SimTypeProps[];
}

export interface DatasProps {
  simCardId: number;
  hlrId: number;
  pin1: string;
  pin2: string;
  imsi: string;
  orgId: number;
  iccid: string;
  areaName: string;
  puk2: string;
  simTypeName: string;
  ki: string;
  simStateName: string;
  puk1: string;
  rowno: number;
  comments: string;
  orgName: string;
  simState: string;
  hlrName: string;
  isBindingFlag: string;
  spId: number;
  areaId: number;
  createdDate: string;
  simTypeId: number;
  stateDate: string;
  staffId: number;
}

export interface SimStateProps {
  comments: string;
  simState: string;
  simStateName: string;
}

export interface AccNbrDetail {
  accNbrState: string;
  orgName: string;
  hlrId: number;
  prefix: string;
  isBindingFlag: string;
  simNbrId: number;
  spId: number;
  orgId: number;
  accNbrStateName: string;
  areaId: number;
  accNbrTypeName: string;
  accNbr: string;
  stateDate: string;
  accNbrId: number;
  accNbrTypeId: number;
  staffId: number;
}
