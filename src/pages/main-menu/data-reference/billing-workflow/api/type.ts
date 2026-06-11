import z from "zod";
import { BwfSysActionSchema } from "../hooks/stepForm";

export type WorkflowTypeParams = {
  workflowId?: number;
  workflowType?: string;
  workflowTypes?: Array<string>;
  spId?: number;
};

export type BillingWorkflowNodeParams = {
  workflowId?: number;
  nodeId?: number;
  excludeNodeId?: number;
  spId?: number;
};

export type StepNodeParams = {
  nodeId?: number;
  workflowId?: number;
  sortRuleName?: string;
};

const BwfActionDetailSchema = z.object({
  stepId: z.number(),
  seq: z.number(),
  srcReAttr: z.string(),
  objReAttr: z.string(),
  function: z.string(),
  param1: z.string(),
  param2: z.string().nullable(),
  srcReAttrCode: z.string(),
  srcReType: z.string(),
  srcReAttrName: z.string(),
  srcReAttrComments: z.string(),
  srcReAttrMeasurable: z.string(),
  objReAttrCode: z.string(),
  objReType: z.string(),
  objReAttrName: z.string(),
  objReAttrComments: z.string(),
  objReAttrMeasurable: z.string(),
});
export type BwfActionDetail = z.infer<typeof BwfActionDetailSchema>;

const BwfCondGroupDetailSchema = z.object({
  condGroupId: z.number(),
  stepId: z.number(),
  matchSortAttrGroupId: z.number(),
  seq: z.number(),
  reAttr: z.string(),
  function: z.string(),
  param1: z.string().nullable(),
  param2: z.string().nullable(),
  sortOperator: z.string(),
  operand: z.string(),
  isConst: z.enum(["Y", "N"]),
  zoneId: z.number().nullable(),
  functionScript: z.string().nullable(),
  reType: z.string(),
  reAttrName: z.string(),
  sortOperatorName: z.string(),
  sortOperatorComments: z.string(),
  zoneItemId: z.number().nullable(),
  parentZoneId: z.number().nullable(),
  zoneName: z.string().nullable(),
  zoneItemComments: z.string().nullable(),
  zoneMapId: z.number().nullable(),
  zoneCode: z.number().nullable(),
  rreAttr: z.number().nullable(),
  rfunction: z.string().nullable(),
  rparam1: z.string().nullable(),
  rparam2: z.string().nullable(),
  rfunctionScript: z.string().nullable(),
  rreType: z.string().nullable(),
  rreAttrName: z.string().nullable(),
});
export type BwfCondGroupDetail = z.infer<typeof BwfCondGroupDetailSchema>;

export const DetailStepFormSchema = z.object({
  stepId: z.number(),
  nodeId: z.number(),
  outputNodeId: z.number().nullable(),
  sortRuleName: z.string(),
  comments: z.string().nullable(),
  execOrder: z.number(),
  effDate: z.string(),
  expDate: z.string().nullable(),
  spId: z.number(),
  bwfCondGroupList: z.array(BwfCondGroupDetailSchema),
  bwfActionList: z.array(BwfActionDetailSchema),
  bwfSysAction: BwfSysActionSchema.nullable(),
});
export type DetailStepForm = z.infer<typeof DetailStepFormSchema>;
