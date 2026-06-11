import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWorkRuleModuleContext } from "../hook/useWorkFlowRuleModuleContext";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { DetailWorkFlowList, initialFormWorkFlow } from "../types/type";
import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash } from "lucide-react";
import { Loader } from "@/components/common/Loading";
import { toast } from "sonner";

const DialogWorkFlowRule = () => {
  const {
    showDialog,
    isSubmitting,
    selectedDatas,
    loading,
    ratable,
    setSelectedDatas,
    onSubmit,
    setLoading,
    fetchRatableName,
    closeDialog,
    recurringOptions,
    postOptions,
    fetchWorkFlowOptions,
    preProcc,
  } = useWorkRuleModuleContext();

  const isEdit = showDialog.mode === "update";

  const form = useForm<DetailWorkFlowList>({
    defaultValues: initialFormWorkFlow(),
  });

  const { errors } = form.formState;

  // useEffect(() => {
  //   if (showDialog.show) {
  //     fetchRatableName(0);
  //     fetchWorkFlowOptions(0);
  //     if (showDialog.mode === "update" && selectedDatas) {
  //       form.reset({
  //         ...selectedDatas,
  //       });
  //     }

  //     // if (showDialog.mode === "update" && selectedDatas) {
  //     //  form.setValue("reId",selectedDatas.reId);
  //     //  form.setValue("postWorkflowId",selectedDatas.postWorkflowId);
  //     //  form.setValue("preWorkflowId",selectedDatas.preWorkflowId);
  //     //  form.setValue("workflowId",selectedDatas.workflowId);

  //     // }
  //   }
  // }, [showDialog.show, showDialog.mode, selectedDatas]);

  useEffect(() => {
    const fetchOptionWorkFlow = async () => {
      setLoading((prev) => ({ ...prev, option: true }));
      try {
        await Promise.all([fetchRatableName(0), fetchWorkFlowOptions(0)]);
      } catch (error) {
        toast.error("Error Get Option List, Please Check Your Connection!!!");
      } finally {
        setLoading((prev) => ({ ...prev, option: false }));
      }
    };

    // const DialogWorkflowInit = async () => {
    //   if (showDialog.show) {
    //     await fetchOptionWorkFlow();
    //     if (showDialog.mode === "update" && selectedDatas) {
    //       form.reset({
    //         ...selectedDatas,
    //       });
    //     }
    //   }
    // };
    const DialogWorkflowInit = async () => {
      if (!showDialog.show) return;
      await fetchOptionWorkFlow();
      if (showDialog.mode === "update" && selectedDatas) {
        form.reset({
          ...selectedDatas,
        });
      } else if (showDialog.mode === "create") {
        form.reset(initialFormWorkFlow());
      }
    };
    DialogWorkflowInit();
  }, [showDialog.show, showDialog.mode, selectedDatas]);

  const handleCloseDialog = () => {
    form.reset(initialFormWorkFlow());
    closeDialog();
  };

  return (
    <Dialog open={showDialog.show} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-3xl w-[90vw] max-h-fit p-0 gap-0 flex flex-col h-full overflow-hidden">
        <DialogHeader className="p-6 border-b flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Update WorkFlow Rule" : "Create New WorkFlow Rule"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          {loading.option || loading.table ? (
            <div className="flex justify-center h-full">
              <Loader title="Loading"></Loader>
            </div>
          ) : (
            <>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col flex-1 min-h-0"
              >
                <div className="mb-6 pb-3 border-b border-gray-200">
                  <h3 className="text-base font-medium text-gray-900">
                    Detail
                  </h3>
                </div>

                <div className="flex-1 px-6 py-4 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="text-red-500">*</span> Ratable Event Name
                    </label>
                    <div className="flex items-center gap-5">
                      <Controller
                        name="reId"
                        control={form.control}
                        rules={{
                          required: "Ratable Event Name is Required",
                        }}
                        render={({ field }) => (
                          <div className="flex flex-col w-full">
                            <Select
                              onValueChange={(val) =>
                                field.onChange(Number(val))
                              }
                              value={
                                field.value === 0
                                  ? undefined
                                  : field.value?.toString()
                              }
                              disabled={isEdit}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Ratable Event Name" />
                              </SelectTrigger>
                              <SelectContent>
                                {ratable.map((type) => (
                                  <SelectItem
                                    key={type.reId}
                                    value={String(type.reId)}
                                  >
                                    {type.reName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.reId && (
                              <p className="text-red-500 text-sm">
                                {errors.reId.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="text-red-500">*</span> Recurring
                      Processing
                    </label>
                    <div className="flex items-center gap-5">
                      <Controller
                        name="workflowId"
                        control={form.control}
                        rules={{
                          required: "Recurring Processing is Required",
                        }}
                        render={({ field }) => (
                          <div className="flex flex-col w-full">
                            <Select
                              onValueChange={(val) =>
                                field.onChange(Number(val))
                              }
                              value={
                                field.value === 0
                                  ? undefined
                                  : field.value?.toString()
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Recurring Processing" />
                              </SelectTrigger>
                              <SelectContent>
                                {recurringOptions.map((type) => (
                                  <SelectItem
                                    key={type.workflowId}
                                    value={String(type.workflowId)}
                                  >
                                    {type.workflowName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.workflowId && (
                              <p className="text-red-500 text-sm">
                                {errors.workflowId.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pre-Processing
                    </label>
                    <div className="flex items-center gap-2">
                      <Controller
                        name="preWorkflowId"
                        control={form.control}
                        render={({ field }) => (
                          <>
                            <Select
                              onValueChange={(val) =>
                                field.onChange(Number(val))
                              }
                              value={
                                field.value === null
                                  ? ""
                                  : field.value.toString()
                              }
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select Post-Processing" />
                              </SelectTrigger>
                              <SelectContent>
                                {preProcc.map((type) => (
                                  <SelectItem
                                    key={type.workflowId}
                                    value={String(type.workflowId)}
                                  >
                                    {type.workflowName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {Number(field.value) > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size={"icon"}
                                className="hover:bg-gray-300 hover: text-black-500 flex"
                                onClick={() => {
                                  field.onChange(null);
                                }}
                              >
                                <Trash />
                              </Button>
                            )}
                          </>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Post-Processing
                    </label>
                    <div className="flex items-center gap-5">
                      <Controller
                        name="postWorkflowId"
                        control={form.control}
                        render={({ field }) => (
                          <>
                            <Select
                              onValueChange={(val) =>
                                field.onChange(Number(val))
                              }
                              value={
                                field.value === null
                                  ? ""
                                  : field.value.toString()
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Post-Processing" />
                              </SelectTrigger>
                              <SelectContent>
                                {postOptions.map((type) => (
                                  <SelectItem
                                    key={type.workflowId}
                                    value={String(type.workflowId)}
                                  >
                                    {type.workflowName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {Number(field.value) > 0 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size={"icon"}
                                className="hover:bg-gray-300 hover:text-red flex "
                                onClick={() => {
                                  field.onChange(null);
                                }}
                              >
                                <Trash />
                              </Button>
                            )}
                          </>
                        )}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 px-6 py-4 border-t flex-shrink-0 col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDialog}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isEdit ? "Update" : "Create"}
                    </Button>
                  </div>
                </div>
              </form>
            </>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default DialogWorkFlowRule;
