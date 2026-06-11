import z from "zod";

export const BalanceTriggerNotificationSchema = z.object({
  triggerNotification: z.string().nullable(),
  triggerMode: z.string().nullable(),
  notifType: z
    .string()
    .nonempty({ message: "Please select a notification type" }),
  notifParamId: z.number().nullable(),
  thresholdId: z.number({ required_error: "Please select a threshold" }),
  spId: z.number({ required_error: "Please select a service provider (SpId)" }),
});

export const BalacnceTriggerNotificationEditSchema = z.object({
  triggerNotification: z.string().nullable(),
  triggerMode: z.string().nullable(),
  notifType: z
    .string()
    .nonempty({ message: "Please select a notification type" }),
  notifParamId: z.number().nullable(),
  thresholdId: z.number({ required_error: "Please select a threshold" }),
  spId: z.number({ required_error: "Please select a service provider (SpId)" }),
});
