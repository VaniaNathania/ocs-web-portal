import z from "zod";

export const SimcardProfileSchema = z.object({
  iccid: z.string().min(1, { message: "ICCID is required." }),
  esn: z.string().optional().nullable(),
  imsi: z.string().min(1, { message: "IMSI is required." }),
  imsi2: z.string().optional().nullable(),
  adm: z.string().optional().nullable(),
  checkSum: z.string().optional().nullable(),
  pin1: z.string().optional().nullable(),
  pin2: z.string().optional().nullable(),
  puk1: z.string().optional().nullable(),
  puk2: z.string().optional().nullable(),
  ki1: z.string().optional().nullable(),
  ki2: z.string().optional().nullable(),
  simTypeId: z
    .number()
    .min(1, { message: "Sim Card Type is required." })
    .refine((val) => val !== 0, { message: "Sim Card Type is required." }),
  simState: z.string().min(1, { message: "Sim Card State is required." }),
  serviceNumber: z.string().optional(),
  accNbrId: z.number().optional(),
  prefix: z.string().optional(),
  accNbr: z.string().optional(),
  // staffId: z.number().optional(),
  orgName: z.string(),
  orgId: z
    .number()
    .min(1, { message: "Organization is required" })
    .refine((val) => val !== 0, { message: "Organization is required." }),
  hlrId: z.number().min(1, { message: "Primary NE is required." }),
  areaId: z.number().min(1, { message: "Telecom Region is required." }),
  comments: z.string().nullable().optional(),
  spId: z.number().optional(),
  isBindingFlag: z.string().optional(),
});

export type SimcardProfileForm = z.infer<typeof SimcardProfileSchema>;
