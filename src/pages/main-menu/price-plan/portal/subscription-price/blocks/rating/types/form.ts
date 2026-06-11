import { z } from "zod";

export const subscriptionCreatePriceRatingSchema = z.object({
  priceVerId: z.number(),
  offerVerId: z.number(),
  ratePlanId: z.number(),
  mappingId: z.number().nullable(),
  effDate: z.string().nonempty({ message: "Effective date is required" }),
  expDate: z.string().nullable(),
  reId: z.number(),
  priceName: z.string().nonempty({ message: "Price name is required" }),
  // Schema
  acctItemTypeId: z
    .number({
      required_error: "Result Account Item Type is required",
      invalid_type_error: "Result Account Item Type is required",
    })
    .int()
    .positive({ message: "Result Account Item Type is required" }),
  price: z.number({
    required_error: "Price is required",
    invalid_type_error: "Price is required",
  }),
  payIndicator: z.string().nullable(),
  rum: z
    .number({
      required_error: "Calculate Unit is required",
      invalid_type_error: "Calculate Unit is required",
    })
    .refine((val) => val === null || val.toString().length <= 12, {
      message: "Calculate Unit must not exceed 12 digits",
    }),
  reAttr: z.number({
    required_error: "Select Unit is required",
    invalid_type_error: "Select Unit is required",
  }),
  comments: z.string().nullable(),
  expressionPrice: z
    .object({
      scriptTempletId: z.number().nullable().optional(),
      jsonScriptPage: z.string().nullable().optional(),
      ruleScript: z.string().nullable().optional(),
      ruleComment: z.string().nullable().optional(),
    })
    .nullable(),
});

export const subscriptionUpdatePriceRatingSchema = z.object({
  effDate: z.string().nonempty({ message: "Effective date is required" }),
  expDate: z.string().nullable(),
  priceName: z.string().nonempty({ message: "Price name is required" }),
  acctItemTypeId: z.number({
    message: "Result Account Item Type is required",
  }),
  price: z.number({
    required_error: "Price is required",
    invalid_type_error: "Price is required",
  }),
  payIndicator: z.string().nullable(),
  rum: z
    .number({
      required_error: "Calculate Unit is required",
      invalid_type_error: "Calculate Unit is required",
    })
    .refine((val) => val === null || val.toString().length <= 12, {
      message: "Calculate Unit must not exceed 12 digits",
    }),
  reAttr: z.number({
    required_error: "Select Unit is required",
    invalid_type_error: "Select Unit is required",
  }),
  comments: z.string().nullable(),
  expressionPrice: z
    .object({
      scriptTempletId: z.number().nullable().optional(),
      jsonScriptPage: z.string().nullable().optional(),
      ruleScript: z.string().nullable().optional(),
      ruleComment: z.string().nullable().optional(),
    })
    .nullable(),
});

export const subscriptionCreateMappingRatingSchema = z.object({
  ratePlanId: z.number(),
  mappingName: z.string().nonempty({ message: "Mapping name is required" }),
  mappingUnit: z
    .array(
      z.object({
        ratePlanZoneId: z.number(),
        mappingType: z.string().nonempty({ message: "Mapping source type is required" }),
        mappingMatchType: z.string().nonempty({ message: "Mapping match type is required" }),
        mappingValue: z.string().nonempty({ message: "Mapping source value is required" }),
      }),
    )
    .min(1, { message: "At least one mapping unit is required" }),
});

export const subscriptionUpdateMappingRatingSchema = z.object({
  mappingName: z.string().nonempty({ message: "Mapping name is required" }),
  mappingUnit: z
    .array(
      z.object({
        ratePlanZoneId: z.number(),
        mappingType: z.string().nonempty({ message: "Mapping source type is required" }),
        mappingMatchType: z.string().nonempty({ message: "Mapping match type is required" }),
        mappingValue: z.string().nonempty({ message: "Mapping source value is required" }),
      }),
    )
    .min(1, { message: "At least one mapping unit is required" }),
});
