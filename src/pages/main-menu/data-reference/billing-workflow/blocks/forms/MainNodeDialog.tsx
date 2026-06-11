import { KeenIcon } from "@/components";
import { BuildFormRow } from "@/components/common/BuildFormRow";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useBillingWorkflowStore } from "../../stores/billingWorkflow.store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CreateDefaultMainForm,
  CreateMainNodePayload,
  CreateMainNodeSchema,
} from "../../hooks/mainForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { toast } from "sonner";
import { useCreateMainNode, useUpdateMainNode } from "../../hooks/useQuery";
import { useEffect } from "react";

const MainNodeDialog = () => {
  const {
    showMainDialog: showDialog,
    openMainDialog,
    closeMainDialog,
    selectedWorkflow,
    selectedMainNode,
  } = useBillingWorkflowStore();
  const { mutateAsync: createMainNode, isPending } = useCreateMainNode(
    selectedWorkflow?.id!
  );
  const { mutateAsync: updateMainNode } = useUpdateMainNode(
    selectedWorkflow?.id!
  );

  const form = useForm<CreateMainNodePayload>({
    resolver: zodResolver(CreateMainNodeSchema),
    defaultValues: CreateDefaultMainForm(selectedWorkflow?.id),
  });

  const {
    control,
    register,
    setValue,
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = form;

  const handleClose = () => {
    closeMainDialog();
    reset(CreateDefaultMainForm());
  };

  const onSubmit = async (data: CreateMainNodePayload) => {
    showDialog.mode === "create"
      ? await createMainNode(data)
      : await updateMainNode(data);
    handleClose();
  };

  useEffect(() => {
    if (showDialog.show) {
      reset((prev) => ({
        ...prev,
        workFlowId: selectedWorkflow?.id,
      }));

      if (showDialog.mode === "update" && selectedMainNode) {
        reset((prev) => ({
          ...prev,
          ...selectedMainNode,
          nodeId: selectedMainNode.id,
        }));
      }
    }
  }, [showDialog.show, selectedMainNode]);

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
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit(onSubmit)(e);
              }}
            >
              <div className="w-full space-y-4">
                <BuildFormRow label="Node Name" isRequired>
                  <Input
                    type="text"
                    placeholder="Enter Node Name"
                    {...register("nodeName")}
                    onKeyDown={(e) => {
                      if(e.key === "Enter") e.preventDefault()
                    }}
                  />
                  {errors?.nodeName && (
                    <span className="text-red-500 text-sm">
                      {errors?.nodeName.message}
                    </span>
                  )}
                </BuildFormRow>
                <div className="flex justify-end pt-2.5 gap-5">
                  <Button
                    variant={"outline"}
                    type="button"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
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

export default MainNodeDialog;
