interface AdvancedInfo {
  triggerId: number | null;
  seq: number | null;
}
interface WorkFlowInfo {
  execOrder: number;
  workflowId: number;
  stepId: number;
}
interface BWFProps {
  sortRuleName: string;
  effDate: string;
  expDate: string | null;
  comments: string | null;
  bwfCondGroupList: bwfCondGroup[] | null;
  bwfActionList: bwfActionItem[] | null;
  bwfSysActionDto: bwfSysActionDto | null;
  spId: number | null;
  nodeId: number | null;
  triggerId: number | null;
  seq: number | null;
}
interface bwfCondList {
  reAttr?: number;
  reAttrName: string | null;
  function: string | null;
  param1: string | null;
  param2: string | null;
  sortOperator?: string;
  sortOperatorName: string | null;
  isConst: string | null;
  rreAttr?: number;
  rreAttrName: string | null;
  rfunction: string | null;
  rparam1: string | null;
  rparam2: string | null;
  seq: number | null;
  spId: number | null;
  operand: string | null;
  zoneId?: number;
}
interface bwfCondGroup {
  bwfCondList: bwfCondList[];
  spId: number | null;
}
interface DetailBWFInfo {
  id: string;
  sortRuleName: string;
  effDate: string;
  expDate: string | null;
  comments: string | null;
  bwfCondGroupList: bwfCondGroup[] | null;
  bwfActionList: bwfActionItem[] | null;
  bwfSysActionDto: bwfSysActionDto | null;
  spId: number | null;
  nodeId: number | null;
  triggerId: number | null;
  seq: number | null;
}
interface ScriptTemplate {
  scriptTempletId: number;
  scriptTempletName: string;
}
interface SortFunctionList {
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
}

interface SortOperatorList {
  sortOperator: string;
  sortOperatorName: string;
  comments: string;
}

interface RetableEventList {
  reAttr: string;
  reAttrName: string;
}

interface bwfSysActionDto {
  sysActionName?: string;
  comments: string | null;
  spId: number | null;
  scriptTempletId: number | null;
  scriptPage: string | null;
  extScript?: string;
}

interface bwfActionListArray {
  srcReAttr: string;
  srcReAttrName: string;
  objReAttr: string;
  objReAttrName: string;
  function: string;
  param1: string;
  param2: string;
  seq: number;
  spId: number;
}
interface bwfActionList {
  bwfActionList: bwfActionItem[] | null; // Updated type
}

interface ScriptTemplate {
  scriptTempletId: number;
  scriptTempletName: string;
}

interface ScriptTemplateDetail {
  scriptTempletName: string;
  templetContent: string;
  templetTypeScript: string;
  templateId: number;
}

interface TemplateProperty {
  id: string;
  name: string;
  displayName: string;
  dataType: string;
  defaultValue: string;
  type: string;
  nullable: string;
  comments: string;
  minValue: string;
  maxValue: string;
  minLength: string;
  maxLength: string;
  value: string;
}

interface ResultField {
  bwfActionList: bwfActionItem[] | null;
  bwfSysActionDto: bwfSysActionDto | null;
}
interface SysActionFunction {
  sysActionName: string;
}
interface bwfActionItem {
  srcReAttr?: number;
  srcReAttrName?: string;
  objReAttr?: number;
  objReAttrName?: string;
  function: string | null;
  param1: string | null;
  param2: string | null;
  seq: number | null;
  spId: number;
}
interface TemplateProperty {
  id: string;
  name: string;
  displayName: string;
  dataType: string;
  defaultValue: string;
  type: string;
  nullable: string;
  comments: string;
  minValue: string;
  maxValue: string;
  minLength: string;
  maxLength: string;
  value: string;
}

interface ComboBoxItem {
  text: string;
  value: string;
}

interface RatableEventList {
  reAttr: number;
  reAttrName: string;
}
