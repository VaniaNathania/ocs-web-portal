export interface DetailWorkFlowList {
  reId: number | undefined;
  reName: string;
  preWorkflowId: number | null;
  preWorkflowName: string | null;
  workflowId: number | undefined ;
  workflowName: string;
  workflowType: string;
  postWorkflowId: number | null;
  postWorkflowName: string;
  spId: number;
  id: number | undefined;
}

export interface loadingDatas {
  option: boolean;
  table: boolean;
}

export interface RatableEventName {
  reId: number | undefined;
  reType: string;
  reName: string;
}
export interface InitWorkFlowByType {
  workflowId: number;
  workflowName: string;
  workflowType: string;
}


export const initialFormWorkFlow = (): DetailWorkFlowList => ({
  reId: undefined,
  reName: "",
  preWorkflowId: null,
  preWorkflowName: null,
  workflowId: undefined,
  workflowName: "",
  workflowType: "",
  postWorkflowId: null,
  postWorkflowName: "",
  spId: 0,
  id: undefined,
});

// Static Select
export const RECC_PROCESS = [
  { value: 1, label: "Benefit" },
  { value: 2, label: "Deduction" },
] as const;

export const RECC_PROC = Object.fromEntries(
  RECC_PROCESS.map((item) => [item.value, item.label])
);
