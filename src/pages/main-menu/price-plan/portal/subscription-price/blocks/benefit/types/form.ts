import { z } from "zod";

export const subscriptionCreateBenefitSchema = z.object({
  ratePlanId: z.number(),
  offerVerId: z.number(),
  priceVerId: z.number().nullable(),
  mappingId: z.number().nullable(),
  effectiveDate: z.string().nonempty({ message: "Effective date is required" }),
  expiryDate: z.string().nullable(),
  benefitName: z.string().nonempty({ message: "Benefit name is required" }),
  remarks: z.string().nullable(),
  benefitValue: z.string().nonempty({ message: "Benefit value is required" }),
  acctBalanceTypeId: z.number({
    required_error: "Account balance type is required",
    invalid_type_error: "Account balance type must be a number",
  }),
  reAttrId: z.number({
    required_error: "Re-attribute is required",
    invalid_type_error: "Re-attribute must be a number",
  }),
  calculationUnit: z.number({
    required_error: "Calculation unit is required",
    invalid_type_error: "Calculation unit must be a number",
  }),
  cycleFloorLimit: z.number().nullable(),
  cycleCeilLimit: z.number().nullable(),
  dailyFloorLimit: z.number().nullable(),
  dailyCeilLimit: z.number().nullable(),
  maximumDays: z.number().nullable(),
  subscriberOnly: z.string().nullable(),
  absoluteEffectiveDate: z.string().nullable(),
  absoluteExpiryDate: z.string().nullable(),
  offsetOfEffectiveDate: z.number().nullable(),
  offsetOfEffectiveDateUnit: z.string().nullable(),
  durationOfAvailability: z.number().nullable(),
  durationOfAvailabilityUnit: z.string().nullable(),
  relativeEffectiveTime: z.string().nullable(),
  relativeExpiryTime: z.string().nullable(),
  relativePeriodUnit: z.string().nullable(),
  offsetOfAbsoluteExpiry: z.number().nullable(),
  balFlags: z.string().nullable(),
  advanceBenefit: z
    .object({
      scriptTempletId: z.number().nullable().optional(),
      jsonScriptPage: z.string().nullable().optional(),
      ruleScript: z.string().nullable().optional(),
      advancedBenefitRemarks: z.string().nullable().optional(),
    })
    .nullable(),
});

export const createSubscriptionBenefitSchema = (periodType: string) => {
  if (periodType === "absolute") {
    return subscriptionCreateBenefitSchema.extend({
      absoluteEffectiveDate: z
        .string()
        .nonempty({ message: "Effective date is required" })
        .nullable()
        .refine((value) => value !== null, "Effective date is required"),
    });
  } else if (periodType === "relative") {
    return subscriptionCreateBenefitSchema.extend({
      offsetOfEffectiveDate: z
        .number()
        .nullable()
        .refine(
          (value) => value !== null,
          "Offset of effective date is required"
        ),
      offsetOfEffectiveDateUnit: z
        .string()
        .nonempty({ message: "Offset of effective date unit is required" })
        .nullable()
        .refine(
          (value) => value !== null,
          "Offset of effective date unit is required"
        ),
      durationOfAvailability: z
        .number()
        .nullable()
        .refine(
          (value) => value !== null,
          "Duration of availability is required"
        ),
      durationOfAvailabilityUnit: z
        .string()
        .nonempty({ message: "Duration of availability unit is required" })
        .nullable()
        .refine(
          (value) => value !== null,
          "Duration of availability unit is required"
        ),

      // absoluteEffectiveDate: z.string().nullable(),
    });
  }

  return subscriptionCreateBenefitSchema;
};

export const subscriptionUpdateBenefitSchema = z.object({
  benefitName: z.string().nonempty({ message: "Benefit name is required" }),
  remarks: z.string().nullable(),
  benefitValue: z.string().nonempty({ message: "Benefit value is required" }),
  acctBalanceTypeId: z
    .number({
      required_error: "Account balance type is required",
      invalid_type_error: "Account balance type must be a number",
    })
    .nullable(),
  reAttrId: z.number().nullable(),
  calculationUnit: z.number({
    required_error: "Calculate Unit is required",
    invalid_type_error: "Calculate Unit is required"
  }),
  cycleFloorLimit: z.number().nullable(),
  cycleCeilLimit: z.number().nullable(),
  dailyFloorLimit: z.number().nullable(),
  dailyCeilLimit: z.number().nullable(),
  maximumDays: z.number().nullable(),
  subscriberOnly: z.string().nullable(),
  absoluteEffectiveDate: z.string().nullable(),
  absoluteExpiryDate: z.string().nullable(),
  offsetOfEffectiveDate: z.number().nullable(),
  offsetOfEffectiveDateUnit: z.string().nullable(),
  durationOfAvailability: z.number().nullable(),
  durationOfAvailabilityUnit: z.string().nullable(),
  relativeEffectiveTime: z.string().nullable(),
  relativeExpiryTime: z.string().nullable(),
  relativePeriodUnit: z.string().nullable(),
  offsetOfAbsoluteExpiry: z.number().nullable(),
  balFlags: z.string().nullable(),
  advanceBenefit: z
    .object({
      scriptTempletId: z.number().nullable().optional(),
      jsonScriptPage: z.string().nullable().optional(),
      ruleScript: z.string().nullable().optional(),
      advancedBenefitRemarks: z.string().nullable().optional(),
    })
    .nullable(),
});

export const updateSubscriptionBenefitSchema = (periodType: string) => {
  if (periodType === "absolute") {
    return subscriptionUpdateBenefitSchema.extend({
      absoluteEffectiveDate: z
        .string()
        .nonempty({ message: "Effective date is required" })
        .nullable()
        .refine((value) => value !== null, "Effective date is required"),
    });
  } else if (periodType === "relative") {
    return subscriptionUpdateBenefitSchema.extend({
      offsetOfEffectiveDate: z
        .number()
        .nullable()
        .refine(
          (value) => value !== null,
          "Offset of effective date is required"
        ),
      offsetOfEffectiveDateUnit: z
        .string()
        .nonempty({ message: "Offset of effective date unit is required" })
        .nullable()
        .refine(
          (value) => value !== null,
          "Offset of effective date unit is required"
        ),
      durationOfAvailability: z
        .number()
        .nullable()
        .refine(
          (value) => value !== null,
          "Duration of availability is required"
        ),
      durationOfAvailabilityUnit: z
        .string()
        .nonempty({ message: "Duration of availability unit is required" })
        .nullable()
        .refine(
          (value) => value !== null,
          "Duration of availability unit is required"
        ),

      // absoluteEffectiveDate: z.string().nullable(),
    });
  }

  return subscriptionUpdateBenefitSchema;
};
