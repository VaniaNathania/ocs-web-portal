import { KeenIcon } from "@/components";
import ToolbarButton from "@/components/common/ToolbarButton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Copy, FileDown, FilePlus, FileUp, Pencil, Trash2 } from "lucide-react";
import { useWorkflowAdditionalApi } from "../api/useBillingWorkflowAPI";
import { useBillingWorkflowStore } from "../stores/billingWorkflow.store";
import { useDeleteWorkflow, useWorkflowList } from "../hooks/useQuery";
import { useConfirmDialog } from "@/providers/ConfirmDialogProvider";

const ListToolbar = () => {
  const { WorkflowRuleList } = useWorkflowAdditionalApi();
  const {
    setSelectedWorkflow,
    selectedWorkflow,
    openWorkflowDialog,
    selectedWorkFlowType,
    setSelectedWorkFlowType,
    setSelectedWorkflowId,
  } = useBillingWorkflowStore();
  const { data: workFlowRuleList } = useWorkflowList({
    workflowType: selectedWorkFlowType || undefined,
  });
  const { mutateAsync: deleteWorkflow } = useDeleteWorkflow();
  const { confirm } = useConfirmDialog();

  const isValidRule = workFlowRuleList?.find((item) => item.id === selectedWorkflow?.id);

  const handleDeleteWorkflow = (workflowId: number) => {
    confirm({
      title: "Delete Workflow",
      message: "Are you sure you want to delete this workflow?",
      onConfirm: async () => {
        await deleteWorkflow(workflowId);
      },
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border bg-white px-3 py-2 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-gray-600">
          <ToolbarButton
            onClick={() => {
              setSelectedWorkflow(null);
              setSelectedWorkFlowType(null);
              setSelectedWorkflowId(null);
            }}
            title="Go back"
            className="flex items-center justify-center rounded-lg shadow-sm transition bg-red-500 hover:bg-red-600 text-white hover:text-white mr-3"
            variant={"ghost"}
          >
            <KeenIcon icon="arrow-left" />
          </ToolbarButton>

          <ToolbarButton title="Copy" isTooltip>
            <Copy className="h-4 w-4" />
          </ToolbarButton>

          <ToolbarButton
            title="New"
            isTooltip
            onClick={() => openWorkflowDialog("create")}
          >
            <FilePlus />
          </ToolbarButton>

          <ToolbarButton
            title="Edit"
            isTooltip
            onClick={() => openWorkflowDialog("update")}
            disabled={!selectedWorkflow}
          >
            <Pencil />
          </ToolbarButton>

          <ToolbarButton
            title="Delete"
            isTooltip
            onClick={() => handleDeleteWorkflow(selectedWorkflow?.id!)}
            disabled={!selectedWorkflow}
            className="hover:bg-red-600 hover:text-white"
          >
            <Trash2 />
          </ToolbarButton>

          <ToolbarButton title="Import" isTooltip>
            <FileDown />
          </ToolbarButton>

          <ToolbarButton title="Export" isTooltip>
            <FileUp />
          </ToolbarButton>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <span className="text-sm font-medium text-gray-700">Workflow Rule</span>

        <Select
          value={isValidRule ? String(selectedWorkflow!.id) : undefined}
          onValueChange={(value) => {
            const id = Number(value);

            const workflow = workFlowRuleList?.find((item) => item.id === id);

            if (!workflow) return;

            // setSelectedWorkflowId(id);
            setSelectedWorkflow(workflow);
          }}
        >
          <SelectTrigger className="h-8 w-[220px]">
            <SelectValue placeholder="Select workflow rule" />
          </SelectTrigger>
          <SelectContent>
            {workFlowRuleList?.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.workflowName} -{" "}
                <span className="text-xs text-slate-400">
                  {item.workflowType}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline">
          Test
        </Button>

        <span className="text-xs text-gray-500 italic max-w-[420px]">
          Tips: please refresh price first on page Price Refresh before
          processing test.
        </span>
      </div>
    </div>
  );
};

export default ListToolbar;
