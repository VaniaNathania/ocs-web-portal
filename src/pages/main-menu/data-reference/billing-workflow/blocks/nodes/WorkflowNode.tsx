import { Handle, NodeProps, Position } from "@xyflow/react";
import { useBillingWorkflowStore } from "../../stores/billingWorkflow.store";
import { BackendMainNode, IStepNode } from "../../utils/workflow.data";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useConfirmDialog } from "@/providers/ConfirmDialogProvider";
import { toast } from "sonner";
import { useCopyMainNode, useDeleteMainNode, useDeleteStepNode } from "../../hooks/useQuery";

type WorkflowNodeBase = {
  id: string;
  label: string;
  status: "A" | "B";
};

type MainNodeData = WorkflowNodeBase & {
  variants: "mainNode";
  data: BackendMainNode;
};

type StepNodeData = WorkflowNodeBase & {
  variants: "stepNode";
  data: IStepNode;
};

type WorkflowNodeData =
  | MainNodeData
  | StepNodeData
  | {
      variants: "workflowNode" | "outputNode";
      id: string;
      label: string;
      status: "A" | "B";
      data: unknown;
    };

type AdditionalProps = {
  type: "MainWorkflow" | "PreProcessing";
};

type WorkflowNodeProps = NodeProps & AdditionalProps;

const getNodeColor = (
  variants: WorkflowNodeData["variants"],
  status: "A" | "B"
) => {
  switch (variants) {
    case "workflowNode":
      return status === "A" ? "bg-green-200" : "bg-blue-200";

    case "mainNode":
      return "bg-blue-400 text-white";

    case "stepNode":
      return "bg-orange-400 text-black";

    case "outputNode":
      return "bg-sky-400 text-black";

    default:
      return "bg-gray-200";
  }
};

const WorkflowNode = ({ data }: WorkflowNodeProps) => {
  const nodeData = data as WorkflowNodeData;
  const {
    openMainDialog,
    openStepDialog,
    selectedWorkflow,
    setShowStepCopyDialog,
    setSelectedWorkflowId,
    setSelectedWorkFlowType,
    setSelectedWorkflow,
  } = useBillingWorkflowStore();
  const { confirm } = useConfirmDialog();
  const { mutateAsync: DeleteStepNode, isPending } = useDeleteStepNode(
    selectedWorkflow?.id || null
  );
  const { mutateAsync: DeleteMainNode } = useDeleteMainNode(
    selectedWorkflow?.id || null
  );
  const { mutateAsync: copyMainNode, isPending: isCopyingNode } = useCopyMainNode(
    selectedWorkflow?.id || null
  );
  const bgColor = getNodeColor(nodeData.variants, nodeData.status);

  const handleDelete = (stepId: number) => {
    confirm({
      title: "Delete Step Node",
      message:
        "Are you sure you want to delete this step node? This action cannot be undone.",
      isDeleting: isPending,
      onConfirm: async () => {
        await DeleteStepNode(stepId);
      },
    });
  };

  const handleDeleteMainNode = (nodeId: number) => {
    confirm({
      title: "Delete Main Node",
      message:
        "Are you sure you want to delete this main node? This action cannot be undone.",
      isDeleting: isPending,
      onConfirm: async () => {
        await DeleteMainNode(nodeId);
      },
    });
  };

  const handleEditMainNode = () => {
    toast.info("Information", {
      icon: "⚠️",
      description: "This feature will be implemented soon.",
    });
  };

  const handleCopyMainNode = async (node: BackendMainNode) => {
    try {
      await copyMainNode({
        nodeId: 0,
        workFlowId: selectedWorkflow?.id,
        nodeName: node.nodeName,
        firstNode: "N",
        spId: node.spId || 0,
        cpSrcNodeId: node.id,
      });
    } catch (error) {
      console.error("Copy main node failed:", error);
    }
  };

  const renderContextMenuItems = () => {
    if (nodeData.variants === "mainNode") {
      return (
        <>
          <ContextMenuItem
            onSelect={() => openStepDialog("create", nodeData.data.id)}
          >
            Create Step Node (new)
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setShowStepCopyDialog(true, nodeData.data.id)}>
            Create Step Node (copy)
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={() => openMainDialog("update", nodeData.data)}
          >
            Edit Main Node
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={() => handleCopyMainNode(nodeData.data)}
          >
            Copy Main Node
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={() => handleDeleteMainNode(nodeData.data.id)}
          >
            Delete Main Node
          </ContextMenuItem>
        </>
      );
    } else if (nodeData.variants === "stepNode") {
      return (
        <>
          <ContextMenuItem
            onSelect={() =>
              openStepDialog("create", nodeData.data.nodeId, nodeData.data)
            }
          >
            Create Step Node (new)
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setShowStepCopyDialog(true, nodeData.data.nodeId)}>
            Create Step Node (copy)
          </ContextMenuItem>
          <ContextMenuItem
            onSelect={() =>
              openStepDialog("update", nodeData.data.nodeId, nodeData.data)
            }
          >
            Edit Step Node
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => handleDelete(nodeData.data.stepId)}>
            Delete
          </ContextMenuItem>
        </>
      );
    }

    // Default context menu for other variants
    return undefined;
  };

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <div
          className={`
          rounded-lg border px-4 py-2 shadow-sm
          ${bgColor}
          ${nodeData.status === "B" ? "cursor-not-allowed" : "cursor-pointer"}
        `}
          onDoubleClick={() => {
            if (
              nodeData.variants === "workflowNode" &&
              nodeData.status === "A"
            ) {
              const mapping: Record<string, string> = {
                "123": "A",
                "987": "G",
                "321": "B",
                "246": "C",
                "357": "D",
                "457": "E",
                "791": "A",
                "9024": "F",
                "145": "H",
              };

              const workflowType = mapping[nodeData.id];
              setSelectedWorkFlowType(workflowType || null);
              setSelectedWorkflow(null); // Clear selected workflow when switching type
              setSelectedWorkflowId(null); // Clear ID because it was incorrectly taking stepId
            }
          }}
        >
          <p className="text-sm font-medium">{nodeData.label}</p>

          <Handle type="target" position={Position.Top} id="input-top" />
          <Handle type="source" position={Position.Top} id="output-top" />

          <Handle type="target" position={Position.Right} id="input-right" />
          <Handle type="source" position={Position.Right} id="output-right" />

          <Handle type="target" position={Position.Bottom} id="input-bot" />
          <Handle type="source" position={Position.Bottom} id="output-bot" />

          <Handle type="target" position={Position.Left} id="input-left" />
          <Handle type="source" position={Position.Left} id="output-left" />
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>{renderContextMenuItems()}</ContextMenuContent>
    </ContextMenu>
  );
};

export default WorkflowNode;
