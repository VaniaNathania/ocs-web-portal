import z from "zod";

export const UploadSimCardSchema = z.object({
  organization: z
    .number()
    .nullable()
    .refine((val) => val !== null && val !== 0, { message: "Organization is required" }),
  simCardType: z
    .number()
    .nullable()
    .refine((val) => val !== null && val > 0, {
      message: "Simcard Type is required",
    }),
  hlrId: z
    .number()
    .nullable()
    .refine((val) => val !== null && val > 0, {
      message: "Primary NE is required",
    }),
  file: z.instanceof(File).nullable().optional(),
});

export type UploadSimCardForm = z.infer<typeof UploadSimCardSchema>;

export const initialForm = (hlrId: number | null): UploadSimCardForm => ({
  organization: null,
  simCardType: null,
  hlrId: hlrId ?? null,
  file: null,
});
