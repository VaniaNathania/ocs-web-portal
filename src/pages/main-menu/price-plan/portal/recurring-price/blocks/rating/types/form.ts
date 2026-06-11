import { z } from "zod";

export const recurringCreateRatingSchema = z.object({
  priceVerId: z.number(),
  offerVerId: z.number(),
  ratePlanId: z.number(),
  mappingId: z.number().nullable(),
  effDate: z.string().nonempty({ message: "Effective date is required" }),
  expDate: z.string().nullable(),
  priceName: z.string().nonempty({ message: "Price name is required" }),
  payIndicator: z.string().nullable(),
  resultAccountItemType: z
    .number({
      required_error: "Result account item type is required",
      invalid_type_error: "Result account item type must be a number",
    })
    .nullable(),
  remarks: z.string().nullable(),
  roundMode: z.number().nullable(),
  price: z.string().nullable(),
  calculateUnit: z.number({ required_error: "Calculate unit is required" }).refine((val) => val !== 0, {
    message: "Calculate unit is required",
  }),
  creditLimit: z.number().nullable(),
  rpPriceUnit: z.string().nullable(),
  newConnection: z.string(),
  termination: z.string(),
  normal: z.string(),
  inAdvance: z.string(),
  expressionPrice: z
    .object({
      scriptTempletId: z.number().nullable().optional(),
      jsonScriptPage: z.string().nullable().optional(),
      ruleScript: z.string().nullable().optional(),
      advancedBenefitRemarks: z.string().nullable().optional(),
    })
    .nullable(),
});

export const createRecurringSchema = (priceType: string) => {
  if (priceType === "base") {
    return recurringCreateRatingSchema.extend({
      price: z.string().nonempty({ message: "Price is required" }),
      calculateUnit: z.number({
        required_error: "Calculate unit is required",
        invalid_type_error: "Calculate unit must be a number",
      }).refine((val) => val !== 0, {
        message: "Calculate unit is required",
      }),
      roundMode: z.number({
        required_error: "Round mode is required",
        invalid_type_error: "Round mode must be a number",
      }),
      rpPriceUnit: z.string().nonempty({ message: "Cycle/Day is required" }),
    });
  }

  return recurringCreateRatingSchema;
};

export const recurringUpdateRatingSchema = z.object({
  priceName: z.string().nonempty({ message: "Price name is required" }),
  payIndicator: z.string().nullable(),
  resultAccountItemType: z
    .number({
      required_error: "Result account item type is required",
      invalid_type_error: "Result account item type must be a number",
    })
    .nullable(),
  remarks: z.string().nullable(),
  roundMode: z.number().nullable(),
  price: z.string().nullable(),
  calculateUnit: z.number().min(1, { message: "Calculate unit is required" }),
  creditLimit: z.number().nullable(),
  rpPriceUnit: z.string().nullable(),
  newConnection: z.string().nullable(),
  termination: z.string().nullable(),
  normal: z.string().nullable(),
  inAdvance: z.string().nullable(),
  expressionPrice: z
    .object({
      scriptTempletId: z.number().nullable().optional(),
      jsonScriptPage: z.string().nullable().optional(),
      ruleScript: z.string().nullable().optional(),
      advancedBenefitRemarks: z.string().nullable().optional(),
    })
    .nullable(),
});

export const updateRecurringSchema = (priceType: string) => {
  if (priceType === "base") {
    return recurringUpdateRatingSchema.extend({
      price: z.string().nonempty({ message: "Price is required" }),
      calculateUnit: z.number({
        required_error: "Calculate unit is required",
        invalid_type_error: "Calculate unit must be a number",
      }).refine((val) => val !== 0, {
        message: "Calculate unit is required",
      }),
      roundMode: z.number({
        required_error: "Round mode is required",
        invalid_type_error: "Round mode must be a number",
      }),
      rpPriceUnit: z.string().nonempty({ message: "RP price unit is required" }),
    });
  }

  return recurringUpdateRatingSchema;
};

export const defaultExpressionPrice = {
  scriptTempletId: null,
  jsonScriptPage: null,
  ruleScript: null,
  advancedBenefitRemarks: null,
};
