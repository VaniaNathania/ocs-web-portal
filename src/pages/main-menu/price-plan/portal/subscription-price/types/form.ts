import { z } from "zod";

export const subscriptionCreateRatePlanSchema = z.object({
  offerVerId: z.number(),
  reId: z.number(),
  ratePlanName: z.string().nonempty({ message: "Rate plan name is required" }),
  ratePlanCode: z.string().optional(),
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

export const subscriptionUpdateRatePlanSchema = z.object({
  ratePlanName: z.string().nonempty({ message: "Rate plan name is required" }),
  ratePlanCode: z.string(),
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
