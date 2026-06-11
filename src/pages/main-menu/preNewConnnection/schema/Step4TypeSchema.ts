import { z } from "zod";

export const Step4TypeSchema = z
  .object({
    areaId: z.number().min(1, "This field is required").optional(),
    orgId: z.number().min(1, "This field is required").optional(),
    reqDate: z.string().min(1, "This field is required").optional(),
    defLangId: z.number().min(1, "This field is required").optional(),
  })
  .superRefine((data, ctx) => {
    const requireFields = (fields: (keyof typeof data)[]) => {
      fields.forEach((field) => {
        if (!data[field]) {
          ctx.addIssue({
            path: [field],
            code: z.ZodIssueCode.custom,
            message: "This field is required",
          });
        }
      });
    };
  });

export type Step4Form = z.infer<typeof Step4TypeSchema>;
