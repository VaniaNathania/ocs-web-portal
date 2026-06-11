import z from "zod";

const createinstalmentItemsSchema = z.object({
  seq: z.number(),
  itemPercent: z
    .number({
      required_error: "Proportion value is required",
      invalid_type_error: "Proportion value must be a number not a decimal",
    })
    .int(),
  repeatTime: z
    .number({
      invalid_type_error: "Sub phases must be a number not a decimal",
    })
    .int(),
  feePercent: z
    .number({
      required_error: "Percent of value is required",
      invalid_type_error: "Percent of value must be a number not a decimal",
    })
    .int(),
  // status: z.enum(["A", "M", "D"]).optional(),
});

const appliedAccountItemTypeSchema = z.object({
  acctItemTypeId: z.number(),
  status: z.enum(["A", "D"]),
});

export const InstallmentCreateSchema = z.object({
  instalmentTypeName: z
    .string({ required_error: "Installment type name is required" })
    .min(1, "Installment type name is required"),
  appliedAccountItemType: z.array(appliedAccountItemTypeSchema).nullable(),
  firstPay: z
    .number({
      required_error: "First pay is required",
      invalid_type_error: "First pay must be a number not a decimal",
    })
    .int()
    .nullable(),
  feePercent: z.number().nullable(),
  comments: z.string().nullable(),
  instalmentItems: z.array(createinstalmentItemsSchema),
});

export type createInstallmentPayload = z.infer<typeof InstallmentCreateSchema>;
export type createInstallmentItems = z.infer<
  typeof createinstalmentItemsSchema
>;
export type appliedAccountItemType = z.infer<
  typeof appliedAccountItemTypeSchema
>;

export const createDefaultInstallmentPayload =
  (): createInstallmentPayload => ({
    instalmentTypeName: "",
    appliedAccountItemType: null,
    firstPay: null,
    feePercent: null,
    comments: null,
    instalmentItems: [],
  });

export const createDefaultInstallmentItems = (): createInstallmentItems => ({
  seq: 0,
  itemPercent: 0,
  repeatTime: 1,
  feePercent: 0,
  // status: "A",
});

export const createDefaultAcctItemType = (
  acctItemTypeId: number
): appliedAccountItemType => ({
  acctItemTypeId,
  status: "A",
});
