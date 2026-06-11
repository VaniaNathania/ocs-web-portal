import * as z from "zod";

export const BwfCondListSchema = z
  .object({
    // condGroupId: z
    //   .number({
    //     required_error: "Please select condition group!",
    //     invalid_type_error: "Please select condition group!",
    //   })
    //   .optional(),
    // seq: z.number(),
    reAttr: z
      .number({
        required_error: "Please select Ratable Event!",
        invalid_type_error: "Please select Ratable Event!",
      })
      .optional(),
    function: z.string().nullable(),
    param1: z.string().nullable(),
    param2: z.string().nullable(),
    sortOperator: z.string().min(1, "Operator is required."),
    isConst: z.enum(["Y", "N"]),
    operand: z.string().nullable(),
    zoneId: z.number().optional(),
    functionScript: z.string().nullable(),
    spId: z.number(),
    rreAttr: z
      .number({
        required_error: "Please select Ratable Event!",
        invalid_type_error: "Please select Ratable Event!",
      })
      .optional(),
    rfunction: z.string().nullable(),
    rparam1: z.string().nullable(),
    rparam2: z.string().nullable(),
    rfunctionScript: z.string().nullable(),
  })
  .superRefine((data, ctx) => {
    const isZoneOperator =
      data.sortOperator === "5" || data.sortOperator === "6";

    if (isZoneOperator && !data.zoneId) {
      ctx.addIssue({
        path: ["zoneId"],
        code: z.ZodIssueCode.custom,
        message: "Zone is required when operator is Zone-based",
      });
    }
  });
export type BwfCondListPayload = z.infer<typeof BwfCondListSchema>;

export const BwfCondGroupListSchema = z.object({
  // condGroupId: z.number(),
  stepId: z.number().optional(),
  spId: z.number(),
  bwfCondList: z.array(BwfCondListSchema),
});
export type BwfCondGroupListPayload = z.infer<typeof BwfCondGroupListSchema>;

export const BwfActionListSchema = z.object({
  stepId: z.number(),
  seq: z.number(),
  srcReAttr: z.number().nullable(),
  objReAttr: z.number().nullable(),
  function: z.string().nullable(),
  param1: z.string().nullable(),
  param2: z.string().nullable(),
  functionScript: z.string().nullable(),
  spId: z.number(),
});
export type BwfActionList = z.infer<typeof BwfActionListSchema>;

export const BwfSysActionSchema = z.object({
  sysActionId: z.number(),
  stepId: z.number(),
  sysActionName: z.string(),
  comments: z.string(),
  spId: z.number(),
  extScript: z.string(),
  scriptPage: z.string(),
  scriptTempletId: z.number(),
});
// export type BwfSysAction = z.infer<typeof BwfSysActionSchema>;

export const CreateStepNodeSchema = z.object({
  stepId: z.number().optional(),
  nodeId: z.number().optional(),
  outputNodeId: z.number().nullable(),
  sortRuleName: z.string().min(1, "Step Name is required"),
  comments: z.string().nullable(),
  execOrder: z.number().nullable(),
  effDate: z.string().min(1, "Effective Date is required"),
  expDate: z.string().nullable(),
  spId: z.number(),
  bwfCondGroupList: z.array(BwfCondGroupListSchema),
  bwfActionList: z.array(BwfActionListSchema),
  bwfSysAction: BwfSysActionSchema.nullable(),
});
export type CreateStepNodePayload = z.infer<typeof CreateStepNodeSchema>;

export const createDefaultStepForm = (): CreateStepNodePayload => ({
  stepId: undefined,
  nodeId: undefined,
  outputNodeId: null,
  sortRuleName: "",
  comments: null,
  execOrder: null,
  effDate: "",
  expDate: null,
  spId: 0,
  bwfCondGroupList: [],
  bwfActionList: [],
  bwfSysAction: null,
});

export const createEmptyGroupCondition = (
  stepId?: number
): BwfCondGroupListPayload => ({
  // condGroupId: index,
  spId: 0,
  stepId: stepId || undefined,
  bwfCondList: [createEmptyCondition()],
});

export const createEmptyCondition = (): BwfCondListPayload => ({
  // condGroupId: undefined,
  // seq: sequence,
  reAttr: undefined,
  function: null,
  param1: null,
  param2: null,
  sortOperator: "",
  isConst: "N",
  operand: null,
  zoneId: undefined,
  functionScript: null,
  spId: 0,
  rreAttr: undefined,
  rfunction: null,
  rparam1: null,
  rparam2: null,
  rfunctionScript: null,
});
