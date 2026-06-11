import { z } from "zod";

export const acctResFreeSchema = z
  .object({
    value: z.number().nullable().optional(),
    rum: z.number().nullable().optional(),
  })
  // error di value
  .refine((data) => (data.value == null && data.rum == null) || (data.value != null && data.rum != null), {
    message: "Deduction Value and Calculation Unit Per must be filled in together",
    path: [],
  })
  // error di rum
  .refine((data) => (data.value == null && data.rum == null) || (data.value != null && data.rum != null), {
    message: "Deduction Value and Calculation Unit Per must be filled in together",
    path: ["rum"],
  });

export const transAcctResCfgSchema = z.object({
  dayThreshold: z.number().nullable().optional(),
  weekThreshold: z.number().nullable().optional(),
  monthThreshold: z.number().nullable().optional(),
  dayCount: z.number().nullable().optional(),
  weekCount: z.number().nullable().optional(),
  monthCount: z.number().nullable().optional(),
  minResidualBal: z.number().nullable().optional(),
  maxAllowed: z.number().nullable().optional(),
  minAllowed: z.number().nullable().optional(),
  transferFactor: z.number().nullable().optional(),
});

export const accountBalanceTypeSchema = z
  .object({
    balType: z
      .number()
      .min(1, { message: "Balance Type is required." })
      .refine((val) => val !== 0, {
        message: "Balance Type is required.",
      }),
    acctResName: z.string().min(1, { message: "Balance Type Name is required." }),
    balCategory: z.string().min(1, { message: "Balance Category is required." }),
    defaultAcctItemTypeId: z.number().nullable().optional(),

    // Optional fields
    parentAcctResId: z.number().nullable().optional(),
    isCurrency: z.string().nullable().optional(),
    comments: z.string().nullable().optional(),
    creditLimit: z.number().nullable().optional(),
    remindDay: z.number().nullable().optional(),
    remindValue: z.number().nullable().optional(),
    maxValue: z.number().nullable().optional(),
    refillable: z.string().nullable().optional(),
    paymentForce: z.string().nullable().optional(),
    stdCode: z.string().nullable().optional(),
    isFreeUnit: z.string().nullable().optional(),
    spId: z.number().nullable().optional(),
    unitTypeId: z.number().nullable().optional(),
    unitPrecision: z.number().nullable().optional(),
    ratioMoney: z.number().nullable().optional(),
    ratioPrecision: z.number().nullable().optional(),
    priority: z.number().nullable().optional(),
    extendRule: z.string().nullable().optional(),
    maxExpDate: z.number().nullable().optional(),
    maxAdjustValue: z.number().nullable().optional(),
    maxChgValue: z.number().nullable().optional(),
    resetZero: z.string().nullable().optional(),
    periodClass: z.string().nullable().optional(),
    storeUnit: z.number().nullable().optional(),
    acmType: z.string().nullable().optional(),
    acmThreshold: z.number().nullable().optional(),
    acmUnit: z.string().nullable().optional(),
    acmAmount: z.number().nullable().optional(),
    ceilLimit: z.number().nullable().optional(),
    floorLimit: z.number().nullable().optional(),
    dailyCeilLimit: z.number().nullable().optional(),
    dailyFloorLimit: z.number().nullable().optional(),
    gracePeriod: z.number().nullable().optional(),
    maxRollover: z.number().nullable().optional(),
    usageType: z.number().nullable().optional(),
    rewardFlag: z.string().nullable().optional(),
    unlimitedFlag: z.string().nullable().optional(),
    adjustType: z.number().nullable().optional(),
    overdraftFlag: z.string().nullable().optional(),
    balanceAggregation: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    rolloverFlag: z.string().nullable().optional(),
    reservePercentage: z.number().nullable().optional(),
    freeFlag: z.string().nullable().optional(),
    adjustFlag: z.string().nullable().optional(),
    clearFlag: z.string().nullable().optional(),
    clearDays: z.number().nullable().optional(),
    customerFlag: z.string().nullable().optional(),

    acctResFree: acctResFreeSchema.nullable().optional(),
    transAcctResCfg: transAcctResCfgSchema.nullable().optional(),
  })
  .refine(
    (data) => {
      // Kalau balType == 3 maka defaultAcctItemTypeId harus ada
      if (data.balType === 3) {
        return data.defaultAcctItemTypeId !== null && data.defaultAcctItemTypeId !== undefined;
      }
      return true;
    },
    {
      message: "Default Account Item Type is required when Balance Type is 3",
      path: ["defaultAcctItemTypeId"], // tunjukkan error di field ini
    },
  );

export const createDefaultAccountBalancePayload = (): AccountBalanceTypePayload => ({
  balType: 0,
  acctResName: "",
  balCategory: "",
  defaultAcctItemTypeId: null,
  parentAcctResId: null,
  isCurrency: "N",
  comments: null,
  creditLimit: null,
  remindDay: null,
  remindValue: null,
  maxValue: null,
  refillable: null,
  paymentForce: "N",
  stdCode: null,
  isFreeUnit: "Y",
  spId: 0,
  unitTypeId: null,
  unitPrecision: null,
  ratioMoney: null,
  ratioPrecision: null,
  priority: null,
  extendRule: null,
  maxExpDate: null,
  maxAdjustValue: null,
  maxChgValue: null,
  resetZero: null,
  periodClass: null,
  storeUnit: null,
  acmType: null,
  acmThreshold: null,
  acmUnit: null,
  acmAmount: null,
  ceilLimit: null,
  floorLimit: null,
  dailyCeilLimit: null,
  dailyFloorLimit: null,
  gracePeriod: null,
  maxRollover: null,
  usageType: null,
  rewardFlag: "N",
  unlimitedFlag: "N",
  adjustType: null,
  overdraftFlag: "N",
  balanceAggregation: "N",
  category: null,
  rolloverFlag: "N",
  reservePercentage: null,
  freeFlag: "N",
  adjustFlag: "N",
  clearFlag: "N",
  clearDays: null,
  customerFlag: "N",
  acctResFree: null,
  transAcctResCfg: null,
});

export type AccountBalanceTypePayload = z.infer<typeof accountBalanceTypeSchema>;
