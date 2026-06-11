import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBillingWorkflowStore } from "../../stores/billingWorkflow.store";
import { KeenIcon } from "@/components";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import {
  CreateDefaultWorkflow,
  WorkflowPayload,
  WorkflowSchema,
} from "../../hooks/workflowForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateWorkflow, useUpdateWorkflow } from "../../hooks/useQuery";
import { useEffect } from "react";

const WorkflowDialog = () => {
  const {
    showWorkflowDialog: showDialog,
    closeWorkflowDialog: closeDialog,
    selectedWorkflow,
    setSelectedWorkflow,
    selectedWorkFlowType,
  } = useBillingWorkflowStore();
  const { mutateAsync: createWorkflow, isPending: isCreating } =
    useCreateWorkflow();
  const { mutateAsync: updateWorkflow, isPending: isUpdating } =
    useUpdateWorkflow();

  const isSubmitting = isCreating || isUpdating;

  const forms = useForm<WorkflowPayload>({
    resolver: zodResolver(WorkflowSchema),
    defaultValues: CreateDefaultWorkflow(selectedWorkFlowType),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = forms;

  const handleClose = () => {
    closeDialog();
    reset(CreateDefaultWorkflow(selectedWorkFlowType));
  };

  const onSubmit = async (data: WorkflowPayload) => {
    showDialog.mode === "create"
      ? await createWorkflow(data)
      : await updateWorkflow(data);
    if (showDialog.mode === "update" && data.workflowId)
      setSelectedWorkflow({
        ...data,
        id: data.workflowId,
      });
    handleClose();
  };

  useEffect(() => {
    if (showDialog.show) {
      if (showDialog.mode === "update" && selectedWorkflow) {
        reset({
          ...selectedWorkflow,
          workflowId: selectedWorkflow.id,
        });
      } else {
        reset(CreateDefaultWorkflow(selectedWorkFlowType));
      }
    }
  }, [showDialog.show, selectedWorkFlowType]);

  return (
    <Dialog
      open={showDialog.show}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent className="container-fixed flex flex-col p-5 overflow-hidden [&>button]:hidden">
        <DialogHeader className="p-5 border-0">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex flex-wrap items-center justify-between grow">
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-semibold leading-none text-gray-900">
                {showDialog.mode === "create" ? "Create" : "Update"} Main Node
              </h1>
            </div>
            <div
              className="opacity-50 cursor-pointer hover:opacity-100"
              onClick={handleClose}
            >
              <KeenIcon icon="cross" className="text-1.5xl" />
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col px-0">
            <form
              action=""
              method="post"
              onSubmit={() => {
                handleSubmit(onSubmit);
              }}
            >
              <div className="w-full space-y-4">
                <BuildFormRow label="Workflow Name" isRequired>
                  <Input
                    type="text"
                    placeholder="Enter worfkflow name"
                    {...register("workflowName")}
                  />
                  {errors?.workflowName && (
                    <span className="text-red-500 text-sm">
                      {errors?.workflowName.message}
                    </span>
                  )}
                </BuildFormRow>

                <BuildFormRow label="Remarks">
                  <Input
                    type="text"
                    placeholder="Enter remarks"
                    {...register("comments")}
                  />
                </BuildFormRow>
                <div className="flex justify-end pt-2.5 gap-5">
                  <Button
                    type="button"
                    variant={"outline"}
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant={"default"}
                    disabled={isSubmitting}
                    className={cn(
                      "bg-red-500 hover:bg-red-600",
                      isSubmitting && "cursor-not-allowed opacity-50"
                    )}
                    onClick={handleSubmit(onSubmit)}
                  >
                    {isSubmitting
                      ? showDialog.mode === "create"
                        ? "Creating..."
                        : "Updating..."
                      : showDialog.mode === "create"
                        ? "Create"
                        : "Update"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowDialog;
