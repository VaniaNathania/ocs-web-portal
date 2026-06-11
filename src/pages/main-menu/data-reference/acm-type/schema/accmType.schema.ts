import { z } from "zod";

export const AccmTypeSchema = z.object({
  resourceId: z.number(),
  resourceName: z.string().min(1, "Accumulation Type Name is Required"),
  acmType: z.string().min(1, "Accumulation Mode is Required"),
  mask: z.string().min(1, "Accumulation Mask is Required"),
  unitTypeId: z.number().nullable(),
  unitPrecision: z.number().nullable(),
  roundWay: z.string().nullable(),
  precision: z.number().nullable(),
  reAttr: z.number().min(1, "Measurement Feature is Required"),
  comments: z.string().optional().nullable(),
  spId: z.number(),
});

export type AccmTypeForm = z.infer<typeof AccmTypeSchema>;

export interface UpdatePayload extends AccmTypeForm {
  id: number;
}

export const initialForm = (): AccmTypeForm => ({
  resourceId: 0,
  resourceName: "",
  acmType: "",
  mask: "",
  unitTypeId: null,
  unitPrecision: null,
  roundWay: null,
  precision: null,
  reAttr: 0,
  comments: null,
  spId: 0,
});
