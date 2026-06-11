import { z } from "zod";

export const subscriptionCreatePriceAccumulationSchema = z.object({
  offerVerId: z.number(),
  ratePlanId: z.number(),
  priceVerId: z.number(),
  mappingId: z.number().nullable(),
  effDate: z.string().nonempty({ message: "Effective date is required" }),
  expDate: z.string().nullable(),
  resourceId: z.number({
    required_error: "Accumulation type is required",
    invalid_type_error: "Accumulation type is required",
  }),
  reAttrId: z.number(),
  calculateUnit: z.number({
    required_error: "Calculate unit is required",
    invalid_type_error: "Calculate unit is required",
  }),
  accumulation: z.string().nonempty({ message: "Accumulation is required"}),
  remarks: z.string().nullable(),
  expressionPrice: z
    .object({
      scriptTempletId: z.number().nullable().optional(),
      jsonScriptPage: z.string().nullable().optional(),
      ruleScript: z.string().nullable().optional(),
      ruleComment: z.string().nullable().optional(),
    })
    .nullable(),
});

export const subscriptionUpdatePriceAccumulationSchema = z.object({
  offerVerId: z.number(),
  ratePlanId: z.number(),
  priceVerId: z.number(),
  mappingId: z.number().nullable(),
  effDate: z.string().nonempty({ message: "Effective date is required" }),
  expDate: z.string().nullable(),
  resourceId: z.number({
    required_error: "Accumulation type unit is required",
    invalid_type_error: "Accumulation type unit is required"
  }),
  reAttrId: z.number(),
  calculateUnit: z.number({
    required_error: "Calculate unit is required",
    invalid_type_error: "Calculate unit is required",
  }),
  accumulation: z.string().nonempty({ message: "Accumulation is required"}),
  remarks: z.string().nullable(),
  expressionPrice: z
    .object({
      scriptTempletId: z.number().nullable().optional(),
      jsonScriptPage: z.string().nullable().optional(),
      ruleScript: z.string().nullable().optional(),
      ruleComment: z.string().nullable().optional(),
    })
    .nullable(),
});
