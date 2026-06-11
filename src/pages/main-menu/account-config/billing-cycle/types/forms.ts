import z from "zod";

export const billingCycleSchema = z.object({
  billingCycleTypeId: z
    .number()
    .int()
    .positive("Billing Cycle Type ID must be positive"),
  beginDate: z.string().min(1).max(50),
  spId: z.number().int().positive("SP ID must be positive"),
  quantity: z.number().int().positive("Quantity must be positive"),
  runDate: z.string().min(1).max(50),
  timeUnit: z.string().min(1).max(50),
});

export const updateBillingCycleSchema = z.object({
  billingCycleTypeId: z
    .number()
    .int()
    .positive("Billing Cycle Type ID must be positive"),
  billingCycleId: z
    .number()
    .int()
    .positive("Billing Cycle ID must be positive"),
  state: z.string().min(1).max(50).nullable(),
  cycleBeginDate: z.string().min(1).max(50),
  cycleEndDate: z.string().min(1).max(50),
  debtDate: z.string().min(1).max(50),
  runDate: z.string().min(1).max(50).nullable(),
  originDate: z.string().min(1).max(50).nullable(),
  documentDate: z.string().min(1).max(50).nullable(),
  postingDate: z.string().min(1).max(50).nullable(),
  invoiceDate: z.string().min(1).max(50).nullable(),
  spId: z.number(),
  notificationDate: z.string().min(1).max(50).nullable(),
});

export const billingCycleTypeSchema = z.object({
  timeUnit: z.string({
    required_error: "Time Unit is required",
  }),

  billingCycleTypeName: z.string({
    required_error: "Billing Cycle Type Name is required",
  }),

  comments: z.string().nullable(),

  quantity: z.number({
    required_error: "Quantity is required",
  }),

  beginDate: z.string({
    required_error: "Begin Date is required",
  }),
  debtDate: z.string({
    required_error: "Debt Date is required",
  }),

  operator: z.string().nullable(),
  billingCycleTypeCode: z.string().nullable(),
  runDate: z.string().nullable(),
  prodType: z.string().nullable(),

  postpaid: z
    .string({
      required_error: "PaidFlag is required",
    })
    .optional(),

  custType: z.string().nullable(),
  spId: z.number(),
});

export type BillingCyclePayload = z.infer<typeof billingCycleSchema>;
export type BillingCycleTypePayload = z.infer<typeof billingCycleTypeSchema>;

export const createDefaultBillingCycleUpdatePayload =
  (): BillingCycleUpdatePayload => ({
    billingCycleId: 0,
    billingCycleTypeId: 0,
    state: null,
    cycleBeginDate: "",
    cycleEndDate: "",
    debtDate: "",
    runDate: null,
    originDate: null,
    documentDate: null,
    postingDate: null,
    invoiceDate: null,
    spId: 0,
    notificationDate: null,
  });

export const createDefaultBillingCycleTypePayload =
  (): BillingCycleTypePayload => ({
    timeUnit: "", // ✅ required → undefined
    billingCycleTypeName: "", // ✅ required → undefined
    comments: null, // ✅ optional → null
    quantity: 0, // ✅ required → undefined
    beginDate: "", // ✅ required → undefined
    debtDate: "", // ✅ required → undefined
    operator: null, // ✅ optional → null
    billingCycleTypeCode: null, // ✅ optional → null
    runDate: null, // ✅ optional → null
    prodType: null, // ✅ optional → null
    postpaid: undefined, // ✅ required → undefined
    custType: null, // ✅ optional → null
    spId: 0,
  });

export const createDefaultBillingCyclePayload = (): BillingCyclePayload => ({
  timeUnit: "",
  billingCycleTypeId: 0,
  beginDate: "",
  spId: 0, //
  quantity: 0,
  runDate: "",
});
