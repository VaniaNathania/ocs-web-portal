import ListToolbar from "./ListToolbar";
import CanvasSection from "./CanvasSection";
import { useWorkflowAction } from "../hooks/useWorkflowAction";
import { LoadingOverlay } from "@/components/common/Loading";
import { Edge, Node } from "@xyflow/react";
import CanvasToolbar from "./CanvasToolbar";
import StepFormDialog from "./forms/StepFormDialog";
import { useBillingWorkflowStore } from "../stores/billingWorkflow.store";
import MainNodeDialog from "./forms/MainNodeDialog";
import { useFunctionList, useWorkflowCanvas } from "../hooks/useQuery";
import WorkflowDialog from "./forms/WorkflowDialog";
import StepSelector from "./StepSelector";
import NodeSelector from "./NodeSelector";

import { useState, useEffect } from "react";

type CanvasFlow = {
  title: string;
  mainNode: any;
  nodes: Node[];
  edges: Edge[];
};

const PreProcessing = () => {
  const { getMainNodes, getStepNodes } = useWorkflowAction();
  const [selectedMainNodeId, setSelectedMainNodeId] = useState<number | null>(null);
  const {
    selectedWorkflow,
    showStepDialog,
    showMainDialog,
    showWorkflowDialog,
    showStepCopyDialog,
    showNodeCopyDialog,
  } = useBillingWorkflowStore();
  const workflowId = selectedWorkflow?.id;

  const { data: canvases, isFetching, error } = useWorkflowCanvas(workflowId);

  useEffect(() => {
    if (canvases && canvases.length > 0 && selectedMainNodeId !== null) {
      const exists = canvases.find(c => c.mainNode.id === selectedMainNodeId);
      if (!exists) setSelectedMainNodeId(null);
    } else if (canvases && canvases.length === 0) {
      setSelectedMainNodeId(null);
    }
  }, [canvases, selectedMainNodeId]);

  const selectedCanvas = canvases?.find(c => c.mainNode.id === selectedMainNodeId);

  // console.log("canvas: ",canvases);
  return (
    <>
      {showMainDialog.show && <MainNodeDialog />}
      {showStepDialog.show && <StepFormDialog />}
      {showWorkflowDialog.show && <WorkflowDialog />}
      {showStepCopyDialog.show && <StepSelector />}
      {showNodeCopyDialog && <NodeSelector />}

      <div>
        <ListToolbar />
        {/* <h1>{workflowId}</h1> */}
        <div className="w-full p-5 rounded-md">
          <CanvasToolbar 
            canvases={canvases || []} 
            selectedNodeId={selectedMainNodeId} 
            setSelectedNodeId={setSelectedMainNodeId} 
          />
        </div>

        {isFetching ? (
          <div className="relative h-[400px]">
            <LoadingOverlay />
          </div>
        ) : selectedMainNodeId === null ? (
          <div className="m-5">
            <div className="flex flex-col gap-5">
              {canvases?.map((canvas, index) => (
                <CanvasSection
                  key={`${workflowId}-${canvas.title}-${index}`}
                  title={canvas.title}
                  nodes={canvas.nodes}
                  edges={canvas.edges}
                />
              ))}
            </div>
          </div>
        ) : selectedCanvas ? (
          <div className="m-5">
            <div className="flex flex-col gap-5">
              <CanvasSection
                key={`${workflowId}-${selectedCanvas.title}`}
                title={selectedCanvas.title}
                nodes={selectedCanvas.nodes}
                edges={selectedCanvas.edges}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default PreProcessing;
