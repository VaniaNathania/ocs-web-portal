import z from "zod";

export const PaymentMethodSchema = z.object({
  paymentMethodName: z
    .string({ required_error: "Payment method name is required" })
    .min(1, "Payment method name is required")
    .max(100, "Payment method name too long, maximum 100 characters allowed"),
  paymentType: z.string(),
  comments: z.string().nullable(),
  paymentMethodCode: z.string().nullable(),
  spId: z.number().nullable(),
  systemReserved: z.string().nullable(),
});

export type createPaymentPayload = z.infer<typeof PaymentMethodSchema>;

export const createDefaultPaymentPayload = (): createPaymentPayload => ({
  paymentMethodName: "",
  paymentType: "",
  comments: null,
  paymentMethodCode: null,
  systemReserved: null,
  spId: null,
});
