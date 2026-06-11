import { z } from "zod";

export const recurringCreateBenefitSchema = z.object({
  ratePlanId: z.number(),
  offerVerId: z.number(),
  priceVerId: z.number(),
  mappingId: z.number().nullable(),
  effectiveDate: z.string().nonempty({ message: "Effective date is required" }),
  expiryDate: z.string().nullable(),
  benefitName: z.string().nonempty({ message: "Benefit name is required" }),
  remarks: z.string().nullable(),
  benefitValue: z.number({ required_error: "Benefit Value is required", invalid_type_error: "Benefit Value must be a number" }),
  acctBalanceTypeId: z.number({
    required_error: "Account Balance Type is required",
    invalid_type_error: "acctBalanceTypeId must be a number",
  }),
  reAttrId: z.number({
    required_error: "Calculation unit is required",
    invalid_type_error: "Calculation unit must be a number",
  }),
  calculationUnit: z.number({
    required_error: "Calculation Unit is required",
    invalid_type_error: "Calculation Unit must be a number",
  }).refine((val) => val !== 0, {
    message: "Calculation unit is required",
  }),
  cycleFloorLimit: z.number().min(0, "Cycle Floor Limit must be ≥ 0").nullable(),
  cycleCeilLimit: z.number().nullable(),
  dailyFloorLimit: z.number().nullable(),
  dailyCeilLimit: z.number().nullable(),
  maximumDays: z.number().nullable(),
  subscriberOnly: z.string().nullable(),
  absoluteEffectiveDate: z.string().min(1, { message: "Absolute Effective date is required" }).nullable(),
  absoluteExpiryDate: z.string().nullable(),
  offsetOfEffectiveDate: z.number().min(0, { message: "Offset Of Effective Date is required" }).nullable(),
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
      scriptTempletId: z.number().nullable(),
      jsonScriptPage: z.string().nullable(),
      ruleScript: z.string(),
      advancedBenefitRemarks: z.string().nullable(),
    })
    .nullable(),
});

export const recurringUpdateBenefitSchema = z.object({
  benefitName: z.string().nonempty({ message: "Benefit name is required" }),
  remarks: z.string().nullable(),
  benefitValue: z.number({
    required_error: "Benefit Value is required",
    invalid_type_error: "Benefit Value must be a number",
  }),
  acctBalanceTypeId: z.number({
    required_error: "Account Balance Type is required",
    invalid_type_error: "acctBalanceTypeId must be a number",
  }),
  reAttrId: z.number({
    required_error: "Calculation unit is required",
    invalid_type_error: "Calculation unit must be a number",
  }),
  calculationUnit: z.number({
    required_error: "Calculation Unit is required",
    invalid_type_error: "Calculation Unit must be a number",
  }).refine((val) => val !== 0, {
    message: "Calculation unit is required",
  }),
  cycleFloorLimit: z.number().min(0, "Cycle Floor Limit must be ≥ 0").nullable(),
  cycleCeilLimit: z.number().nullable(),
  dailyFloorLimit: z.number().nullable(),
  dailyCeilLimit: z.number().nullable(),
  maximumDays: z.number().nullable(),
  subscriberOnly: z.string().nullable(),
  absoluteEffectiveDate: z.string().min(1, { message: "Absolute Effective date is required" }).nullable(),
  absoluteExpiryDate: z.string().nullable(),
  offsetOfEffectiveDate: z.number().min(0, { message: "Offset Of Effective Date is required" }).nullable(),
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
      scriptTempletId: z.number().nullable(),
      jsonScriptPage: z.string().nullable(),
      ruleScript: z.string().nullable(),
      advancedBenefitRemarks: z.string().nullable(),
    })
    .nullable(),
});
