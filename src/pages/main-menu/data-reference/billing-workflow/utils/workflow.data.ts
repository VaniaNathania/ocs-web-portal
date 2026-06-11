type WorkflowStatus = "A" | "B";
type YesNo = "Y" | "N";

export type WorkflowStep = {
  id: string;
  label: string;
  status: WorkflowStatus;
};

export type WorkflowDefinition = {
  id: string;
  name: string;
  steps: WorkflowStep[];
};

export interface BackendMainNode {
  id: number;
  workflowId: number;
  nodeName: string;
  firstNode: YesNo;
  spId: number;
  cpSrcNodeId: number | null;
}

export interface IWorkflowType {
  id:           number;
  workflowName: string;
  comments:     string | null;
  spId:         number;
  workflowType: string;
}


export interface IStepNode {
  nodeId: number;
  workflowId: number;
  stepId: number;
  effDate: string;
  expDate: string | null;
  sortRuleName: string;
  comments: string | null;
  execOrder: number;
  inputNodeId: number;
  inputNodeName: string;
  outputNodeId: number | null;
  outputNodeName: string | null;
}

export type BackendStepNode = {
  nodeId: number;
  execOrder: number;
  inputNodeId: number | null;
  outputNodeId: number | null;
  inputNodeName: string;
  outputNodeName: string | null;
};

export type OperatorList = {
  sortOperator: string;
  sortOperatorName: string;
  comments: string;
};

export type FunctionList = {
  function: string;
  paramNum: number;
  param1Name: string;
  param1ValueType: string;
  param1Desc: string;
  param1ValueScript: string;
  param2Name: string;
  param2ValueType: string;
  param2Desc: string;
  param2ValueScript: string;
  usageFlag: string;
  functionTypeFlag: string;
  param1ValueTypeName: string;
  param2ValueTypeName: string;
  comments: string;
};

export type RatableEventList = {
  reAttr: number;
  reAttrName: string;
};

export interface BwfCondGroupList {
  bwfCondGroupList: BwfCondGroupListElement[];
}

export interface BwfCondGroupListElement {
  condGroupId: number;
  stepId: number;
  spId: number;
  bwfCondList: BwfCondList[];
}

export interface BwfCondList {
  condGroupId: number;
  seq: number;
  reAttr: number;
  function: string;
  param1: string;
  param2: string;
  sortOperator: string;
  isConst: string;
  operand: string;
  zoneId: number;
  functionScript: string;
  spId: number;
  rreAttr: number;
  rfunction: string;
  rparam1: string;
  rparam2: string;
  rfunctionScript: string;
}

export interface BwfActionList {
  bwfActionList: BwfActionListElement[];
}

export interface BwfActionListElement {
  stepId: number;
  seq: number;
  srcReAttr: number;
  objReAttr: number;
  function: string;
  param1: string;
  param2: string;
  functionScript: string;
  spId: number;
}
export interface BwfSysAction {
  bwfSysAction: BwfSysActionClass;
}

export interface BwfSysActionClass {
  sysActionId: number;
  stepId: number;
  sysActionName: string;
  comments: string;
  spId: number;
  extScript: string;
  scriptPage: string;
  scriptTempletId: number;
}

export interface IResultExpression {
  stepId:         number;
  seq:            number;
  srcReAttr:      number | null;
  objReAttr:      number | null;
  function:       string | null;
  param1:         string | null;
  param2:         string | null;
  functionScript: string | null;
  spId:           number;
}
