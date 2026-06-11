import * as z from "zod";

export const WorkflowSchema = z.object({
  workflowId: z.number().optional(),
  workflowName: z.string().min(1, "Workflow Name is required."),
  comments: z.string().nullable(),
  spId: z.number(),
  workflowType: z.string().min(1, "Workflow Type is required."),
});
export type WorkflowPayload = z.infer<typeof WorkflowSchema>;

export const CreateDefaultWorkflow = (workflowType?: string | null): WorkflowPayload => ({
  workflowId: undefined,
  workflowName: "",
  comments: null,
  spId: 0,
  workflowType: workflowType || "A",
});
