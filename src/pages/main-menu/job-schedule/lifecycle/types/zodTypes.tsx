import * as z from "zod";

export const LifeCycleTypeSchema = z.object({
  lifecycleTypeName: z.string().min(1, "LifeCycle Type Name are Required"),
  spId: z.number(),
  comments: z.string(),
});

export type LifeCycleType = z.infer<typeof LifeCycleTypeSchema>;
export const initFormLifeCycleType = (): LifeCycleType => ({
  lifecycleTypeName: "",
  spId: 0,
  comments: "",
});

export const EventProcessSchema = z.object({
  bcId: z
    .string()
    .min(1, "Operation Module is Necessary di min")
    .refine((val) => val != "0", {
      message: "Operation Module is Necessary di refine",
    }),
  priority: z.string(),
  avp: z.string(),
});
export type EventProcess = z.infer<typeof EventProcessSchema>;

export const EventListSchema = z.object({
  subsEventId: z
    .string()
    .min(1, "Subscriber Event is Necessary")
    .refine((val) => val != "0", {
      message: "Operation Module is Necessary di refine",
    }),
  srcProdState: z.string(),
  objProdState: z.string(),
  adviceType: z.array(z.string()).optional(),
  bcId: z.string().optional(),
  timer: z.number(),
  eventProcess: z.array(EventProcessSchema),
});
export type EventListZod = z.infer<typeof EventListSchema>;
