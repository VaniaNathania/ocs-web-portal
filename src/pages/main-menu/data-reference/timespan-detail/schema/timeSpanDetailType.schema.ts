import { duration } from "moment";
import { optional, z } from "zod";

export const TimeSpanDetailSidebarTypeSchema = z.object({
  timeSpanName: z.string().min(1, "Time Span Name is required"),
  comments: z.string().nullable(),
  spId: z.number().optional(),
});

export type TimeSpanDetailSidebarForm = z.infer<typeof TimeSpanDetailSidebarTypeSchema>;

export const TimeSpanDetailContentTypeSchema = z
  .object({
    timeSpanId: z.number(),
    seq: z.number().optional(),
    cycleBeginDate: z.string().min(1, "Start Date is required"),
    cycleBeginTimeReAttr: z.string().min(1, "Start Time is required"),
    cycleUnit: z.number().min(1, "Cycle is required"),
    timeUnit: z.string(),
    duration: z.number().min(1, "Duration is required"),
  })
  .transform((data) => ({
    ...data,
    cycleBeginDate: `${data.cycleBeginDate}T${data.cycleBeginTimeReAttr}`,
    cycleUnit: data.cycleUnit,
    timeUnit: data.timeUnit,
    duration: data.duration,
  }));

export type TimeSpanDetailContentForm = z.infer<typeof TimeSpanDetailContentTypeSchema>;
