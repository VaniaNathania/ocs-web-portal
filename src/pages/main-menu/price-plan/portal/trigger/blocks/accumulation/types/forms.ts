import z from "zod";

export const TriggerAcmSchema = z.object({
  effectiveDate: z.string().nonempty({ message: "Effective date is required" }),
  expiryDate: z.string().nullable(),
  accumulationType: z
    .number({
      required_error: "Please select an accumulation type",
    })
    .refine((val) => val !== 0, {
      message: "Please select an accumulation type",
    }),
  triggerMode: z.string().nonempty({ message: "Trigger mode is required" }),
  offerVerId: z.number({ required_error: "Please select a version" }),
  destination: z.string().nullable(),
  stateDate: z.string().nullable(),
  thresholdDetail: z.string().nullable(),
});

export const TriggerEditAcmSchema = z.object({
  effectiveDate: z.string().nonempty({ message: "Effective date is required" }),
  expiryDate: z.string().nullable(),
  triggerType: z.string().nonempty({ message: "Trigger type is required" }),
  destination: z.string().nullable(),
  accumulationType: z
    .number({
      required_error: "Please select an accumulation type",
    })
    .refine((val) => val !== 0, {
      message: "Please select an accumulation type",
    }),
});

export const TriggerBenefitSchema = z.object({
  benefitValue: z.number(),
  accountBalanceType: z.number(),
  cycleCeilLimit: z.number().nullable(),
  dailyCeilLimit: z.number().nullable(),
  maximumDays: z.number().nullable(),
  subscriberOnly: z.string().nullable(),
  extendRule: z.string().nullable(),
  // resultAccountItemType: z.string().nullable(),
  resultAccountItemType: z.array(z.number()).default([]).optional(),
  periodType: z.string().nullable(),
  absoluteEffectiveDate: z.string().nullable(),
  absoluteExpiryDate: z.string().nullable(),
  offsetOfEffectiveDate: z.number().nullable(),
  dayOffset: z.number().nullable(),
  effUnit: z.string().nullable(),
  expUnit: z.string().nullable(),
  durationOfAvailability: z.number().nullable(),
  relativeEffectiveTime: z.string().nullable(),
  relativeExpiryTime: z.string().nullable(),
  relativePeriodUnit: z.string().nullable(),
  offsetOfAbsoluteExpiry: z.number().nullable(),
  thresholdId: z.number({ required_error: "Please select a threshold" }),
  triggerMode: z.string().nullable(),
});

export const TriggerAcmNotificationSchema = z.object({
  triggerNotification: z.string().nullable(),
  triggerMode: z.string().nullable(),
  notifType: z.string().nonempty({ message: "Please select a notification type" }),
  notifParamId: z.number().nullable(),
  thresholdId: z.number({ required_error: "Please select a threshold" }),
  spId: z.number({ required_error: "Please select a service provider (SpId)" }),
});

export const TriggerAcmNotificationEditSchema = z.object({
  triggerNotification: z.string().nullable(),
  triggerMode: z.string().nullable(),
  notifType: z.string().nonempty({ message: "Please select a notification type" }),
  oldNotifType: z.string().nonempty({ message: "Please insert an old notification type" }),
  oldNotifParamId: z.number().nullable(),
  oldAdviceEventId: z.number().nullable(),
  notifParamId: z.number().nullable(),
  thresholdId: z.number({ required_error: "Please select a threshold" }),
  spId: z.number({ required_error: "Please select a service provider (SpId)" }),
});

export const TriggerAcmEventSchema = z.object({
  subsEventId: z.number({ required_error: "Please select an event" }),
  triggerMode: z.string().nullable(),
  antibillShock: z.string().nullable(),
  eventName: z.string().nullable(),
  notifyParamsId: z.number().nullable(),
  extAttr: z.string().nullable().optional(),
  spId: z.number({ required_error: "Please select a service provider (SpId)" }),
  oldSubsEventId: z.number().nullable(),
  acmThresholdId: z.number({ required_error: "Please select a threshold" }),
});

export const TriggerAcmEventEditSchema = z.object({
  subsEventId: z.number({ required_error: "Please select an event" }),
  triggerMode: z.string().nullable(),
  antibillShock: z.string().nullable(),
  eventName: z.string().nullable(),
  notifyParamsId: z.number().nullable(),
  extAttr: z.string().nullable().optional(),
  spId: z.number({ required_error: "Please select a service provider (SpId)" }),
  oldSubsEventId: z.number().nullable(),
  acmThresholdId: z.number({ required_error: "Please select a threshold" }),
});
