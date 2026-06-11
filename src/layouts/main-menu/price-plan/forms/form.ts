import { z } from "zod";

export const pricePlanCreateSchema = z.object({
  offerType: z.string().nonempty({ message: "Offer type is required" }),
  offerName: z.string().nonempty({ message: "Offer name is required" }),
  pricePlanType: z
    .string()
    .nonempty({ message: "Price plan type is required" }),
  applyLevel: z.string().nonempty({ message: "Apply level is required" }),
  pricePlanCode: z.string(),
  remarks: z.string(),
  spId: z.number(),
  priority: z.number(),
  serviceType: z.number().nullable(),
  baseValidPeriod: z
    .string()
    .nonempty({ message: "Base valid period is required" }),
  expBaseValidPeriod: z.string().nullable(),
  version: z.object({
    effDate: z.string().nonempty({ message: "Effective date is required" }),
    expDate: z.string().nullable(),
    sourceFrom: z.string().nonempty({ message: "Source from is required" }),
    isCopyOfferAttr: z
      .string()
      .nonempty({ message: "Copy offer attr is required" }),
    oldPricePlanVerId: z.number().nullable(),
    prefix: z.string().nullable(),
    postfix: z.string().nullable(),
  }),
});

export const pricePlanUpdateSchema = z.object({
  offerType: z.string().nonempty({ message: "Offer type is required" }),
  offerName: z.string().nonempty({ message: "Offer name is required" }),
  pricePlanCode: z.string(),
  baseValidPeriod: z
    .string()
    .nonempty({ message: "Base valid period is required" }),
  expBaseValidPeriod: z.string().nullable(),
  serviceType: z.number().nullable(),
  remarks: z.string(),
  applyLevel: z.string().nonempty({ message: "Apply level is required" }),
  pricePlanType: z.string().nonempty({ message: "Price plan type is required" }),
});
