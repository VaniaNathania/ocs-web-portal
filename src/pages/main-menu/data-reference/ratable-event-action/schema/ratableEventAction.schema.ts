import { z } from "zod";

export const RatableEventActionMasterTypeSchema = z.object({
  reActionName: z.string().min(1, "Action Name is required"),
  reActionCode: z.string().min(1, "Action Code is required"),
  comments: z.string().nullable().optional(),
  spId: z.number(),
});

export type RatableEventActionMasterForm = z.infer<typeof RatableEventActionMasterTypeSchema>;

export const RatableEventActionContentTypeSchema = z
  .object({
    id: z.number().optional(),
    reActionId: z.number(),
    pricePlanId: z.number().min(1, "Price Name is required"),
    effDate: z.string().min(1, "Eff Date is required"),
    expDate: z.string().nullable().optional(),
    operationFlag: z.string().min(1, "Operation Flag is required").optional(),
    relEffUnit: z.string().nullable().optional(),
    defPeriod: z.enum(["Y", "N"]).optional(),
    periodType: z.enum(["Y", "N"]).optional().nullable(),
    absEffDate: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" || val === null ? null : val)),
    absExpDate: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" || val === null ? null : val)),
    relEffOffset: z.coerce.number().optional().nullable(),
    relExpOffset: z.coerce.number().optional().nullable(),
    relExpUnit: z.string().optional().nullable(),
    relEffTime: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" || val === null ? null : val)),
    relExpTime: z
      .string()
      .optional()
      .nullable()
      .transform((val) => (val === "" || val === null ? null : val)),
    periodRelUnit: z.string().optional().nullable(),
    spId: z.number(),
  })
  .superRefine((data, ctx) => {
    if (data.defPeriod === "Y") return;

    if (!data.periodType) {
      ctx.addIssue({
        path: ["periodType"],
        code: z.ZodIssueCode.custom,
        message: "Period Type is required.",
      });
    }

    if (data.periodType === "Y") {
      if (!data.absEffDate) {
        ctx.addIssue({
          path: ["absEffDate"],
          code: z.ZodIssueCode.custom,
          message: "Absolute Effective Date is required.",
        });
      }
      if (!data.absExpDate) {
        ctx.addIssue({
          path: ["absExpDate"],
          code: z.ZodIssueCode.custom,
          message: "Absolute Expiry Date is required.",
        });
      }
    }

    if (data.periodType === "N") {
      if (!data.relEffOffset) {
        ctx.addIssue({
          path: ["relEffOffset"],
          code: z.ZodIssueCode.custom,
          message: "Offset of Effective Date is required.",
        });
      }

      if (!data.relEffUnit) {
        ctx.addIssue({
          path: ["relEffUnit"],
          code: z.ZodIssueCode.custom,
          message: "Time Unit is required.",
        });
      }
    }
  });

export type RatableEventActionContentForm = z.infer<typeof RatableEventActionContentTypeSchema>;

export const initialForm = (): RatableEventActionContentForm => ({
  reActionId: 0,
  pricePlanId: 0,
  effDate: "",
  expDate: null,
  operationFlag: "",
  defPeriod: "Y",
  periodType: null,
  absEffDate: null,
  absExpDate: null,
  relEffOffset: null,
  relEffUnit: null,
  relExpOffset: null,
  relExpUnit: null,
  relEffTime: null,
  relExpTime: null,
  periodRelUnit: null,
  spId: 0,
});

export const initialFormMaster = (): RatableEventActionMasterForm => ({
  reActionName: "",
  reActionCode: "",
  comments: null,
  spId: 0,
});
