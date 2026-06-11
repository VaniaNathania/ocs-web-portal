import z from "zod";

export const BalanceTriggerEventSchema = z.object({
  subsEventId: z.number({ required_error: "Please select an event" }),
  triggerMode: z.string().nullable(),
  antibillShock: z.string().nullable(),
  eventName: z.string().nullable(),
  notifyParamsId: z.number().nullable(),
  extAttr: z.string().nullable().optional(),
  spId: z.number({ required_error: "Please select a service provider (SpId)" }),
  oldSubsEventId: z.number().nullable(),
  balThresholdId: z.number({ required_error: "Please select a threshold" }),
});

export const BalanceTriggerEditEventSchema = z.object({
  subsEventId: z.number({ required_error: "Please select an event" }),
  triggerMode: z.string().nullable(),
  antibillShock: z.string().nullable(),
  eventName: z.string().nullable(),
  notifyParamsId: z.number().nullable(),
  extAttr: z.string().nullable().optional(),
  spId: z.number({ required_error: "Please select a service provider (SpId)" }),
  oldSubsEventId: z.number().nullable(),
  balThresholdId: z.number({ required_error: "Please select a threshold" }),
});
