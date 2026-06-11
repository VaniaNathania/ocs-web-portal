import ToolbarButton from "@/components/common/ToolbarButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FilePlus, Pencil, RectangleHorizontal, Trash2 } from "lucide-react";
import { useBillingWorkflowStore } from "../stores/billingWorkflow.store";
import { useDeleteMainNode } from "../hooks/useQuery";
import { useConfirmDialog } from "@/providers/ConfirmDialogProvider";

interface CanvasToolbarProps {
  canvases: any[];
  selectedNodeId: number | null;
  setSelectedNodeId: (id: number | null) => void;
}

const CanvasToolbar = ({ canvases, selectedNodeId, setSelectedNodeId }: CanvasToolbarProps) => {
  const { openMainDialog: openDialog, selectedWorkflow } =
    useBillingWorkflowStore();
  
  const { confirm } = useConfirmDialog();
  const { mutateAsync: deleteMainNode, isPending } = useDeleteMainNode(
    selectedWorkflow?.id || null
  );

  const selectedMainNode = canvases.find(c => c.mainNode.id === selectedNodeId)?.mainNode;

  const handleDelete = () => {
    if (!selectedNodeId) return;
    confirm({
      title: "Delete Main Node",
      message: "Are you sure you want to delete this main node? This action cannot be undone.",
      isDeleting: isPending,
      onConfirm: async () => {
        await deleteMainNode(selectedNodeId);
        setSelectedNodeId(null);
      },
    });
  };
  return (
    <div className="flex items-center justify-between rounded-md border bg-white px-4 py-2 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-gray-600">
          <ToolbarButton
            title="New"
            isTooltip
            onClick={() => openDialog("create")}
          >
            <FilePlus className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton 
            title="Edit" 
            isTooltip
            onClick={() => {
              if (selectedMainNode) {
                openDialog("update", selectedMainNode);
              }
            }}
            disabled={!selectedMainNode}
          >
            <Pencil className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="Delete"
            isTooltip
            onClick={handleDelete}
            disabled={!selectedMainNode}
            className="hover:bg-red-600 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <span className="text-sm font-medium text-gray-700">Workflow Rule</span>

        <Select 
          value={selectedMainNode ? String(selectedNodeId) : "all"}
          onValueChange={(val) => setSelectedNodeId(val === "all" ? null : Number(val))}
        >
          <SelectTrigger className="h-8 w-[220px]">
            <SelectValue placeholder="Select node" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Nodes</SelectItem>
            {canvases.map((canvas) => (
              <SelectItem key={canvas.mainNode.id} value={String(canvas.mainNode.id)}>
                {canvas.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <RectangleHorizontal
            className="h-4 w-7 bg-blue-400 mr-1"
            stroke="none"
          />
          <span className="text-xs text-gray-500">: Input Node</span>{" "}
        </div>
        <div className="flex items-center">
          <RectangleHorizontal
            className="h-4 w-7 bg-sky-400 border-none mr-1"
            stroke="none"
          />
          <span className="text-xs text-gray-500">: Output Node</span>
        </div>
        <div className="flex items-center">
          <RectangleHorizontal
            className="h-4 w-7 bg-orange-400 border-none mr-1"
            stroke="none"
          />
          <span className="text-xs text-gray-500">: Step Node</span>
        </div>
      </div>
    </div>
  );
};

export default CanvasToolbar;
