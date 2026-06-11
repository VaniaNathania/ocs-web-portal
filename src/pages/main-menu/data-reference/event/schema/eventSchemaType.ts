import z from "zod";

export const DynamicFeatureTypeSchema = z.object({
  reAttrId: z.number().optional(),
  defReAttr: z.number().nullable().optional(),
  dependProdSpecId: z.number().nullable().optional(),
  attrCatg: z.string().min(1, "Feature Source is require."),
  dynAttrId: z.number().min(1, "Source Attribute is require."),
  tag: z.number().nullable().optional(),
  reAttrSrcType: z.string().nullable(),
  reAttrName: z.string().min(1, "Feature Name is require."),
  measurable: z.string(),
  comments: z.string().nullable().optional(),
  reType: z.string().nullable(),
});

export type DynamicFeatureForm = z.infer<typeof DynamicFeatureTypeSchema>;

export const initialFormDyn = (selectedReType: string | null): DynamicFeatureForm => ({
  defReAttr: null,
  dependProdSpecId: null,
  attrCatg: "",
  dynAttrId: 0,
  tag: null,
  reAttrSrcType: "B",
  reAttrName: "",
  measurable: "N",
  comments: null,
  reType: selectedReType ?? null,
});

export const StaticFeatureTypeSchema = z.object({
  reAttrId: z.number().optional(),
  defReAttr: z.number().min(1, "Reserved Feature is require."),
  dependProdSpecId: z.number().nullable().optional(),
  attrCatg: z.string().optional().nullable(),
  dynAttrId: z.number().optional().nullable(),
  tag: z.number().nullable().optional(),
  reAttrSrcType: z.string().nullable(),
  reAttrName: z.string().min(1, "Feature Name is require."),
  measurable: z.string(),
  comments: z.string().nullable().optional(),
  reType: z.string().nullable(),
});

export type StaticFeatureForm = z.infer<typeof StaticFeatureTypeSchema>;

export const initialFormStatic = (selectedReType: string | null): StaticFeatureForm => ({
  defReAttr: 0,
  dependProdSpecId: null,
  attrCatg: null,
  dynAttrId: null,
  tag: null,
  reAttrSrcType: "A",
  reAttrName: "",
  measurable: "N",
  comments: null,
  reType: selectedReType ?? null,
});

export const TagFeatureTypeSchema = z.object({
  reAttrId: z.number().optional(),
  defReAttr: z.number().nullable().optional(),
  dependProdSpecId: z.number().nullable().optional(),
  attrCatg: z.string().optional().nullable(),
  dynAttrId: z.number().optional().nullable(),
  tag: z.number().min(1, "Tag Name is require."),
  reAttrSrcType: z.string().nullable(),
  reAttrName: z.string().min(1, "Feature Name is require."),
  measurable: z.string(),
  comments: z.string().nullable().optional(),
  reType: z.string().nullable(),
});

export type TagFeatureForm = z.infer<typeof TagFeatureTypeSchema>;

export const initialFormTag = (selectedReType: string | null): TagFeatureForm => ({
  defReAttr: 0,
  dependProdSpecId: null,
  attrCatg: null,
  dynAttrId: null,
  tag: 0,
  reAttrSrcType: "A",
  reAttrName: "",
  measurable: "N",
  comments: null,
  reType: selectedReType ?? null,
});

export const UsageTypeSchema = z.object({
  parentReId: z.number().nullable().optional(),
  offerId: z.number().nullable().optional(),
  prodSpecId: z.number().nullable().optional(),
  recurringReType: z.string().nullable().optional(),
  subsEventId: z.number().nullable().optional(),
  reAttr: z.number().nullable().optional(),
  reType: z.string(),
  reName: z.string().min(1, "Event Name is require."),
  reCode: z.string().nullable().optional(),
  comments: z.string().nullable().optional(),
});

export type UsageForm = z.infer<typeof UsageTypeSchema>;

export const initialFormUsage = (reId: number | null): UsageForm => ({
  parentReId: reId ?? null,
  offerId: null,
  prodSpecId: null,
  recurringReType: null,
  subsEventId: null,
  reAttr: null,
  reType: "1",
  reName: "",
  reCode: null,
  comments: null,
});

export const SubscriptionTypeSchema = z.object({
  parentReId: z.number().nullable().optional(),
  offerId: z.number().nullable().optional(),
  prodSpecId: z.number().nullable().optional(),
  recurringReType: z.string().nullable().optional(),
  subsEventId: z.number().min(1, "Event Type is require."),
  reAttr: z.number().nullable().optional(),
  reType: z.string(),
  reName: z.string().min(1, "Event Name is require."),
  reCode: z.string().nullable().optional(),
  comments: z.string().nullable().optional(),
});

export type SubscriptionForm = z.infer<typeof SubscriptionTypeSchema>;

export const initialFormSubscription = (reId: number | null): SubscriptionForm => ({
  parentReId: reId ?? null,
  offerId: null,
  prodSpecId: null,
  recurringReType: null,
  subsEventId: 0,
  reAttr: null,
  reType: "3",
  reName: "",
  reCode: null,
  comments: null,
});

export const RecurringTypeSchema = z
  .object({
    parentReId: z.number().nullable().optional(),
    offerId: z.number().nullable().optional(),
    prodSpecId: z.number().nullable().optional(),
    recurringReType: z.string().min(1, "Event Type is require."),
    subsEventId: z.number().nullable().optional(),
    reAttr: z.number().nullable().optional(),
    reType: z.string(),
    reName: z.string().min(1, "Event Name is require."),
    reCode: z.string().nullable().optional(),
    comments: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.reType === "2" && !data.offerId && !data.prodSpecId) {
      ctx.addIssue({
        path: ["offerId"],
        code: z.ZodIssueCode.custom,
        message: "Offer is required.",
      });
    } else if (data.reType === "D" && !data.prodSpecId) {
      ctx.addIssue({
        path: ["prodSpecId"],
        code: z.ZodIssueCode.custom,
        message: "Price Plan is required.",
      });
    }
  });

export type RecurringForm = z.infer<typeof RecurringTypeSchema>;

export const initialFormRecurring = (reId: number | null): RecurringForm => ({
  parentReId: reId ?? null,
  offerId: null,
  prodSpecId: null,
  recurringReType: "",
  subsEventId: null,
  reAttr: null,
  reType: "2",
  reName: "",
  reCode: null,
  comments: null,
});
