import z from "zod";

export const DepositCreateSchema = z.object({
  name: z.string().min(1),
  comments: z.string().nullable(),
  charge: z.coerce.number().min(0, "Charge is required"),
  spId: z.coerce.number(),
  depositTypeCode: z.string().nullable(),
  refundable: z.enum(["Y", "N"]),
  transCredit: z.enum(["Y", "N"]),
  checkDuration: z.number().nullable(),
});

export type createDepositPayload = z.infer<typeof DepositCreateSchema>;

export const createDefaultDepositPayload = (): createDepositPayload => ({
  spId: 0,
  name: "",
  charge: 0,
  depositTypeCode: null,
  refundable: "N",
  checkDuration: null,
  transCredit: "N",
  comments: null,
});
