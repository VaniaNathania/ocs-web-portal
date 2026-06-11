import { eachHourOfInterval } from "date-fns";
import {
  BwfCondGroupListPayload,
  BwfCondListPayload,
  CreateStepNodePayload,
} from "../hooks/stepForm";
import { WorkflowDefinition } from "../utils/workflow.data";

export const ONLINE_WORKFLOW: WorkflowDefinition = {
  id: "online",
  name: "Online Workflow",
  steps: [
    { id: "123", label: "Pre-processing", status: "A" },
    { id: "456", label: "Authentication", status: "B" },
    { id: "789", label: "Get Balance Credit", status: "B" },
    { id: "987", label: "Extended Sort", status: "A" },
    { id: "654", label: "Rating", status: "B" },
    { id: "321", label: "Post-processing", status: "A" },
  ],
};

export const RECURRING_WORKFLOW: WorkflowDefinition = {
  id: "recurring",
  name: "Recurring Workflow",
  steps: [
    {
      id: "135",
      label: "Data Preparation",
      status: "B",
    },
    {
      id: "246",
      label: "Pre-Processing",
      status: "A",
    },
    {
      id: "357",
      label: "Recurring Processing",
      status: "A",
    },
    {
      id: "457",
      label: "Post Processing",
      status: "A",
    },
  ],
};

export const CDR_FILEWORKFLOW: WorkflowDefinition = {
  id: "cdr-file",
  name: "CDR File Workflow",
  steps: [
    {
      id: "579",
      label: "CDR Collection",
      status: "B",
    },
    {
      id: "680",
      label: "CDR Parsing",
      status: "B",
    },
    {
      id: "791",
      label: "Pre Processing",
      status: "A",
    },
    {
      id: "802",
      label: "Rating",
      status: "B",
    },
    {
      id: "913",
      label: "CDR Generation",
      status: "B",
    },
  ],
};

export const USAGE_PRICEPLAN: WorkflowDefinition = {
  id: "usage-priceplan",
  name: "Usage Priceplan",
  steps: [
    {
      id: "9024",
      label: "Usage Price Plan",
      status: "A",
    },
  ],
};

export const RECURRING_PRICEPLAN: WorkflowDefinition = {
  id: "recurring-priceplan",
  name: "Recurring Priceplan",
  steps: [
    {
      id: "145",
      label: "Recurring Price Plan",
      status: "A",
    },
  ],
};
