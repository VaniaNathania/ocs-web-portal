import z from "zod";

export const CreateMainNodeSchema = z.object({
  nodeId: z.number().optional(),
  workFlowId: z
    .number({
      required_error: "Please select workflow first!",
      invalid_type_error: "Invalid workflow id",
    })
    .optional(),
  nodeName: z.string().min(1, "Node name is required."),
  firstNode: z.string().optional(),
  spId: z.number(),
  cpSrcNodeId: z.number().nullable().optional(),
});
export type CreateMainNodePayload = z.infer<typeof CreateMainNodeSchema>;

export const CreateDefaultMainForm = (
  workFlowId?: number
): CreateMainNodePayload => ({
  nodeId: undefined,
  workFlowId: workFlowId,
  nodeName: "",
  spId: 0,
  firstNode: "Y",
  cpSrcNodeId: undefined,
});
