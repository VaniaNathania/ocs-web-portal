import { Container, KeenIcon } from "@/components";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import "@xyflow/react/dist/style.css";
import { mapWorkflowToFlow } from "./utils/workflow.mapper";
import {
  CDR_FILEWORKFLOW,
  ONLINE_WORKFLOW,
  RECURRING_PRICEPLAN,
  RECURRING_WORKFLOW,
  USAGE_PRICEPLAN,
} from "./api/data";
import CanvasSection from "./blocks/CanvasSection";
import PreProcessing from "./blocks/PreProcessing";
import { useBillingWorkflowStore } from "./stores/billingWorkflow.store";

const BillingWorkflow = () => {
  const navigate = useNavigate();
  const { selectedWorkFlowType } = useBillingWorkflowStore();

  if (selectedWorkFlowType) {
    return <PreProcessing />;
  }

  const { nodes: onlineNodes, edges: onlineEdges } =
    mapWorkflowToFlow(ONLINE_WORKFLOW);
  const { nodes: recurringNodes, edges: recurringEdges } =
    mapWorkflowToFlow(RECURRING_WORKFLOW);
  const { nodes: cdrNodes, edges: cdrEdges } =
    mapWorkflowToFlow(CDR_FILEWORKFLOW);
  const { nodes: usageNodes, edges: usageEdges } =
    mapWorkflowToFlow(USAGE_PRICEPLAN);
  const { nodes: recurringPriceplanNodes, edges: recurringPriceplanEdges } =
    mapWorkflowToFlow(RECURRING_PRICEPLAN);

  return (
    <Container className="pt-6">
      <div className="mb-6 rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            title="Go back"
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500 shadow-sm transition hover:bg-red-600"
          >
            <KeenIcon icon="arrow-left" className="text-lg text-white" />
          </Button>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Billing Workflow
            </h1>
            <p className="text-sm text-gray-500">
              Business Common · Workflow Designer
            </p>
          </div>
        </div>
      </div>

      {/* Canvas Wrapper */}
      <div className="flex flex-col w-full gap-5 mb-8">
        <CanvasSection
          title="Online Workflow"
          nodes={onlineNodes}
          edges={onlineEdges}
        />

        <CanvasSection
          title="Recurring Workflow"
          nodes={recurringNodes}
          edges={recurringEdges}
        />

        <CanvasSection
          title="CDR File Workflow"
          nodes={cdrNodes}
          edges={cdrEdges}
        />

        <CanvasSection
          title="Usage Price Plan"
          nodes={usageNodes}
          edges={usageEdges}
        />

        <CanvasSection
          title="Recurring Price Plan"
          nodes={recurringPriceplanNodes}
          edges={recurringPriceplanEdges}
        />
      </div>
    </Container>
  );
};

export default BillingWorkflow;
