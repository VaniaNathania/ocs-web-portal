import { z } from "zod";

export const conditionGroupSchema = z.object({
  grpId: z.number().int().positive("Group ID must be positive"),
  seqNo: z.number().int().nonnegative("Sequence number cannot be negative"),
  sortOperator: z.string().min(1, "Sort operator is required"),
  ldpRefCondId: z
    .number()
    .int()
    .positive("Reference condition ID must be positive"),
  lparam1: z.string().min(1, "Parameter 1 is required").nullable(),
  rval: z.string().min(1, "Right value is required"),
});

export const discountValueSchema = z.object({
  refValue: z.string(),
  refCellValue: z.string(),
  refFloorValue: z.string(),
});

export const discountDetailSchema = z.object({
  seqNo: z.number().int().nonnegative("Sequence number cannot be negative"),
  disctCalcMethod: z.string().min(1, "Discount calculation method is required"),
  dpId: z.number().int().positive().nullable(),
  discountValue: discountValueSchema.optional(),
  sval: z.string().nonempty("Start Value is required"),
  eval: z.string().nonempty("End Value is required"),
});

export const discountDetailsSchema = z
  .array(discountDetailSchema)
  .superRefine((details, ctx) => {
    details.forEach((detail, index) => {
      const sval = Number(detail.sval);
      const evalVal = Number(detail.eval);

      if (sval >= evalVal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start Value must be less than or equal to End Value",
          path: [index, "sval"],
        });
      }

      if (index > 0) {
        const prevEval = Number(details[index - 1].eval);
        if (sval <= prevEval) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Start Value must be greater than or equal to previous End Value",
            path: [index, "sval"],
          });
        }
      }
    });
  });

export const mappingAccountItemTypeSchema = z.object({
  acctItemTypeId: z
    .number()
    .int()
    .positive("Account item type ID must be positive"),
  priority: z.number().int().nonnegative("Priority cannot be negative"),
});

export const referenceObjectSchema = z.object({
  objIdentityId: z.number().int().positive().nullable(),
  gstSeq: z.number().int().nonnegative().nullable(),
  objectName: z
    .string()
    .min(1, "Object name is required")
    .max(255, "Object name too long"),
  objectType: z
    .string()
    .min(1, "Object type is required")
    .max(100, "Object type too long"),
  memberAlias: z.string().max(255, "Member alias too long").nullable(),
  mappingAccountItemTypes: z.array(mappingAccountItemTypeSchema),
  dpRefCondType: z
    .string()
    .max(100, "Reference condition type too long")
    .nullable(),
  tabDpCondGrpName: z
    .string()
    .max(255, "Condition group name too long")
    .nullable(),
  insertDiscountConditionGroup: z.array(conditionGroupSchema),
});

export const dpRuleSchema = z.object({
  scriptTempletId: z.number().int().nullable(),
  jsonScriptPage: z.string().nullable(),
  ruleScript: z.string().nullable(),
  remarks: z.string().max(1000, "Remarks too long").nullable(),
});

export const discountTypeEnum = z.enum(["E", "T"], {
  errorMap: () => ({ message: "Invalid discount type" }),
});

export const promotionEnum = z.enum(["1", "4"], {
  errorMap: () => ({ message: "Promotion must be 1 or 4" }),
});

export const negativeResultEnum = z.enum(["Y", "N"], {
  errorMap: () => ({ message: "Negative result must be Y or N" }),
});

export const discountPayloadBase = z.object({
  offerVerId: z.number().int().positive("Offer version ID must be positive"),
  discountName: z
    .string()
    .min(1, "Discount name is required")
    .max(255, "Discount name too long")
    .trim(),
  discountType: discountTypeEnum,
  promotion: promotionEnum,
  resultAccountItemType: z
    .number({
      required_error: "Result Account Item Type is required",
      invalid_type_error: "Result Account Item Type is required",
    })
    .int()
    .positive("Result Account Item Type is required")
    .nullable(),
  distributeMethod: z
    .string()
    .min(1, "Distribute method is required")
    .max(100, "Distribute method too long")
    .nullable(),
  negativeResult: negativeResultEnum,
  tabDiscountType: z
    .string()
    .min(1, "Tab discount type is required")
    .max(100, "Tab discount type too long")
    .nullable(),
  remarks: z.string().max(1000, "Remarks too long").nullable(),

  discountDetail: discountDetailsSchema,
  dpRule: dpRuleSchema.nullable(),
  referenceObject: referenceObjectSchema.nullable(),
  calculationObject: referenceObjectSchema.nullable(),
  applyingObject: referenceObjectSchema.nullable(),
  dpRefCondType: z
    .string()
    .max(100, "Reference condition type too long")
    .nullable(),
  tabDpCondGrpName: z
    .string()
    .min(1, "Condition group name is required")
    .max(255, "Condition group name too long")
    .nullable(),
  insertDiscountConditionGroup: z.array(conditionGroupSchema),
});

export const discountPayloadSchema = discountPayloadBase.superRefine(
  (data, ctx) => {
    if (data.resultAccountItemType === null) {
      ctx.addIssue({
        path: ["resultAccountItemType"],
        code: z.ZodIssueCode.custom,
        message: "Result Account Item Type is required",
      });
    }

    // Validations for discount type "T" (non-E)
    if (data.discountType === "T") {
      if (!data.distributeMethod) {
        ctx.addIssue({
          path: ["distributeMethod"],
          code: z.ZodIssueCode.custom,
          message: "Distribute method is required for discount type T",
        });
      }

      if (!data.tabDiscountType) {
        ctx.addIssue({
          path: ["tabDiscountType"],
          code: z.ZodIssueCode.custom,
          message: "Tab discount type is required for discount type T",
        });
      }

      if (
        !data.referenceObject?.objectName ||
        data.referenceObject.objectName.trim() === ""
      ) {
        ctx.addIssue({
          path: ["referenceObject", "objectName"],
          code: z.ZodIssueCode.custom,
          message: "Object name is required for discount type T",
        });
      }

      if (
        !data.referenceObject?.objectType ||
        data.referenceObject.objectType.trim() === ""
      ) {
        ctx.addIssue({
          path: ["referenceObject", "objectType"],
          code: z.ZodIssueCode.custom,
          message: "Object type is required for discount type T",
        });
      }

      if (!data.tabDpCondGrpName || data.tabDpCondGrpName.trim() === "") {
        ctx.addIssue({
          path: ["tabDpCondGrpName"],
          code: z.ZodIssueCode.custom,
          message: "Condition group name is required for discount type T",
        });
      }
    }

    if (data.discountType === "E") {
    }
  }
);

//
// UPDATE SCHEMA (semua field optional, tapi masih pakai base)
//
export const updateDiscountPayloadSchema = discountPayloadBase.partial();

export type ConditionGroup = z.infer<typeof conditionGroupSchema>;
export type DiscountDetail = z.infer<typeof discountDetailSchema>;
export type MappingAccountItemType = z.infer<
  typeof mappingAccountItemTypeSchema
>;
export type ReferenceObject = z.infer<typeof referenceObjectSchema>;
export type DpRule = z.infer<typeof dpRuleSchema>;
export type DiscountPayload = z.infer<typeof discountPayloadSchema>;
export type UpdateDiscountPayload = z.infer<typeof updateDiscountPayloadSchema>;

export const createDefaultDiscountDetail = (): DiscountDetail => ({
  seqNo: 1,
  disctCalcMethod: "",
  dpId: null,
  discountValue: {
    refValue: "",
    refCellValue: "",
    refFloorValue: "",
  },
  sval: "",
  eval: "",
});

export const createDefaultConditionGroup = (): ConditionGroup => ({
  grpId: 1,
  seqNo: 1,
  sortOperator: "AND",
  ldpRefCondId: 1,
  lparam1: "",
  rval: "",
});

export const createDefaultReferenceObject = (): ReferenceObject => ({
  objIdentityId: null,
  gstSeq: null,
  objectName: "",
  objectType: "",
  memberAlias: null,
  mappingAccountItemTypes: [],
  dpRefCondType: null,
  tabDpCondGrpName: null,
  insertDiscountConditionGroup: [],
});

export const createDefaultDiscountPayload = (
  offerVerId: number,
  discountType: "E" | "T"
): DiscountPayload => ({
  offerVerId: offerVerId,
  discountName: "",
  discountType: discountType,
  promotion: "4",
  resultAccountItemType: null,
  distributeMethod: null,
  negativeResult: "N",
  tabDiscountType: null,
  remarks: null,
  discountDetail: [],
  dpRule: null,
  referenceObject: null,
  calculationObject: null,
  applyingObject: null,
  dpRefCondType: null,
  tabDpCondGrpName: null,
  insertDiscountConditionGroup: [],
});

export const validateDiscountPayload = (data: unknown) => {
  return discountPayloadSchema.safeParse(data);
};

export const validateDiscountPayloadByType = (
  data: unknown,
  discountType: "E" | "T"
) => {
  if (discountType === "E") {
    const typeESchema = discountPayloadBase.superRefine((data, ctx) => {});
    return typeESchema.safeParse(data);
  } else {
    return discountPayloadSchema.safeParse(data);
  }
};
