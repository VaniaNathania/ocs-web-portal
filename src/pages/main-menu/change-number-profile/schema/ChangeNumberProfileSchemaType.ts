import z from "zod";

export const ChangeNumberProfileSchema = z.object({
  orgName: z.string().optional(),
  serviceNumber: z.string().optional(),
  accNbrId: z.number().optional(),
  prefix: z.string().optional(),
  accNbr: z.string().optional(),
  staffId: z.number().optional(),
  orgId: z.number().optional(),
  accNbrClassId: z.number().nullable().optional(),
  accNbrTypeId: z.number({
    required_error: "Number Type is required",
  }),
  accNbrState: z.string().optional(),
  hlrId: z.number({
    required_error: "Primary NE is required",
  }),
  neInfo: z.string().nullable().optional(),
  areaId: z.number({
    required_error: "Telkom Region is required",
  }),
  nbrClassJudgeId: z.number().nullable().optional(),
  stateDate: z.string().optional(),
  comments: z.string().nullable().optional(),
  ppsPwd: z.string().nullable().optional(),
  preCharging: z.string().nullable().optional(),
  peerOperatorCode: z.string().nullable().optional(),
  npAuthCode: z.string().nullable().optional(),
  spId: z.number().optional(),
  isBindingFlag: z.string().optional(),
  partyType: z.string().nullable().optional(),
  partyCode: z.string().nullable().optional(),
});

export type ChangeNumberProfileForm = z.infer<typeof ChangeNumberProfileSchema>;

const accNbrDto = z.object({
  accNbrId: z.number(),
  accNbr: z.string(),
});

export const ReservationSchema = z.object({
  accNbrDto: z.array(accNbrDto),
  reserveExpDate: z.string(),
  reserveType: z.string(),
  partyType: z.string(),
  reserveCommets: z.string(),
  reservePartyType: z.string(),
  reservePartyCode: z.number(),
  spId: z.number(),
});

export type ReservationForm = z.infer<typeof ReservationSchema>;
