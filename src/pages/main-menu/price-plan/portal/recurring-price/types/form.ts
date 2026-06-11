import z from "zod";

export const recurringCreateRatePlanSchema = z.object({
  offerVerId: z.number(),
  reId: z.number(),
  ratePlanName: z.string().nonempty({ message: "Rate plan name is required" }),
  ratePlanCode: z.string().nullable(),
  remarks: z.string().nullable(),
  ratePlanType: z.string().nonempty({ message: "Rate plan type is required" }),
  templateFlag: z.string(),
  catalogId: z.number().nullable(),
  spId: z.number(),
  ratePlanZones: z
    .array(
      z
        .object({
          priority: z.number(),
          mappingSrcType: z.string().nullable(),
          mappingSrcValue: z.string().nullable(),
          mappingDesValue: z.string().nullable(),
          mappingDesType: z.string().nullable(),
          labelShow: z.string().nullable(),
        })
        .nullable()
    )
    .nullable(),
});

export const recurringUpdateRatePlanSchema = z.object({
  ratePlanName: z.string().nonempty({ message: "Rate plan name is required" }),
  ratePlanCode: z.string().nullable(),
  remarks: z.string().nullable(),
  zoneFlag: z.string(),
  ratePlanZones: z
    .array(
      z.object({
        priority: z.number(),
        mappingSrcType: z.string().nullable(),
        mappingSrcValue: z.string().nullable(),
        mappingDesValue: z.string().nullable(),
        mappingDesType: z.string().nullable(),
        labelShow: z.string().nullable(),
      })
    )
    // .optional()
    .nullable(),
});

export const recurringCreateMappingSchema = z.object({
  ratePlanId: z.number(),
  mappingName: z.string().nonempty({ message: "Mapping name is required" }),
  mappingUnit: z
    .array(
      z.object({
        ratePlanZoneId: z.number(),
        mappingType: z
          .string()
          .nonempty({ message: "Mapping source type is required" }),
        mappingMatchType: z
          .string()
          .nonempty({ message: "Mapping match type is required" }),
        mappingValue: z
          .string()
          .nonempty({ message: "Mapping source value is required" }),
      })
    )
    .min(1, { message: "At least one mapping unit is required" }),
});

export const recurringUpdateMappingSchema = z.object({
  mappingName: z.string().nonempty({ message: "Mapping name is required" }),
  mappingUnit: z
    .array(
      z.object({
        ratePlanZoneId: z.number(),
        mappingType: z
          .string()
          .nonempty({ message: "Mapping source type is required" }),
        mappingMatchType: z
          .string()
          .nonempty({ message: "Mapping match type is required" }),
        mappingValue: z
          .string()
          .nonempty({ message: "Mapping source value is required" }),
      })
    )
    .min(1, { message: "At least one mapping unit is required" }),
});
