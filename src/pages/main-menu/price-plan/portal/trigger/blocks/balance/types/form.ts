import z from "zod";

export const BalanceTriggerSchema = z.object({
  balanceType: z.array(z.string()).min(1, "Account Balance Type is requred"),
  destination: z.string().nullable(),
  effDate: z.string().nonempty({ message: "Effective date is required" }),
  expDate: z.string().nullable(),
  isLimit: z.enum(["Y", "N"]),
  offerVerId: z.number({ required_error: "Please select a version" }),
  state: z.string(),
  triggerMode: z.string().nonempty({ message: "Trigger mode is required" }),
  acctResIdAsString: z.string().nullable(),
});

export const ThresholdBalanceSchema = z.object({
  value: z.number({ required_error: "Value is required" }).nullable(),
  interval: z.number().nullable(),
  reAttr: z.number().nullable(),
  touchPcrf: z.enum(["Y", "N"]),
  triggerMode: z.string().nullable(),
  triggerId: z.number({ required_error: "Please select a balance trigger" }),
  spId: z.number().nullable(),
  triggerBy: z.string().nonempty({ message: "Trigger by is required" }),
});
