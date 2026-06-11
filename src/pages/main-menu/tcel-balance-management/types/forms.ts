import { number } from "yup";
import z from "zod";

export const TcelBalanceAdjustmentSchema = z.object({
  acctId: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().int().positive("Acct Id must be positive")
  ),
  acctNbr: z.string().min(1, "Account number is required"),
  acctResId: z.number().int().positive("Please select an account resource ID"),
  balance: z
    .number({
      required_error: "Balance is required",
      invalid_type_error: "Balance must be a number",
    })
    .positive("Balance must be greater than 0"),
  effDate: z.string().min(1, "Effective date is required"),
  expDate: z.string().min(1, "Expiry date is required"),
  comment: z.string().nullable().optional(),
  partyType: z.string(),
  partyCode: z.string(),
  contactChannelId: z.number(),
});

export type TcelBalanceAdjustmentForm = z.input<
  typeof TcelBalanceAdjustmentSchema
>;

export const createDefaultTcelBalanceAjustmentPayload =
  (): TcelBalanceAdjustmentForm => ({
    acctId: 0,
    acctNbr: "",
    acctResId: 0,
    balance: undefined as any,
    effDate: "",
    expDate: "",
    comment: "",
    partyType: "A",
    partyCode: "1",
    contactChannelId: 1,
  });
