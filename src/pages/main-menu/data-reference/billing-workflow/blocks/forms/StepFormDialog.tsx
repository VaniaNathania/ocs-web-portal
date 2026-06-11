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
import { Button } from "@/components/ui/button";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import {
  createDefaultStepForm,
  CreateStepNodePayload,
  CreateStepNodeSchema,
} from "../../hooks/stepForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/utils/cn";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ConditionSection from "./blocks/ConditionSection";
import {
  useCreateStepNode,
  useRatableEventList,
  useSortOperatorList,
  useUpdateStepNode,
  useZoneMapList,
} from "../../hooks/useQuery";
import { Loading } from "@/components/common/Loading";
import { Loader } from "@/components/common/Loading";
import ResultTab from "./blocks/ResultTab";
import { toDateOnly } from "@/utils/Date";
import { useBillingWorkflowApi } from "../../api/useBillingWorkflowAPI";
import {
  mapActionDetailToPayload,
  mapCondGroupDetailToPayload,
} from "../../utils/workflow.mapper";

const tabs = [
  {
    id: "expression",
    label: "Expression",
  },
  {
    id: "result",
    label: "Result",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

const StepFormDialog = () => {
  const {
    showStepDialog: showDialog,
    closeStepDialog: closeDialog,
    setShowFormCondition,
    selectedStepNode,
    selectedWorkflow,
  } = useBillingWorkflowStore();
  const { GetDetailStepNode } = useBillingWorkflowApi();
  const { mutateAsync: CreateStepNode } = useCreateStepNode(
    selectedWorkflow?.id || null,
  );
  const { mutateAsync: UpdateStepNode } = useUpdateStepNode(
    selectedWorkflow?.id || null,
  );
  const { isLoading: isLoadingRatableEvent, error: errorRatableEvent } =
    useRatableEventList();
  const { isLoading: isLoadingSortOperator, error: errorSortOperator } =
    useSortOperatorList();
  const { isLoading: isLoadingZoneMap, error: errorZoneMap } = useZoneMapList();

  const isLoading =
    isLoadingRatableEvent && isLoadingSortOperator && isLoadingZoneMap;

  const hasError = errorRatableEvent || errorSortOperator || errorZoneMap;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("expression");
  const StepNodeData = selectedStepNode.data;

  const isCreating = showDialog.show && showDialog.mode === "create";
  const isUpdating = showDialog.show && showDialog.mode === "update";

  const form = useForm<CreateStepNodePayload>({
    resolver: zodResolver(CreateStepNodeSchema),
    defaultValues: createDefaultStepForm(),
  });

  const {
    control,
    watch,
    register,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = form;

  const { fields: condGroups } = useFieldArray({
    control,
    name: "bwfCondGroupList",
  });

  // const totalConditions = condGroups.reduce(
  //   (total, group) => total + group.bwfCondList.length,
  //   0
  // );

  const handleClose = () => {
    closeDialog();
    setShowFormCondition(false);
    reset();
  };

  const getDetailData = async (stepId: number) => {
    try {
      const response = await GetDetailStepNode(stepId);

      if (!response.status) return toast.error(response.message);
      // const parsed = DetailStepFormSchema.parse(response.data);
      const parsed = response.data;

      reset({
        stepId: parsed.stepId,
        nodeId: parsed.nodeId,
        outputNodeId: parsed.outputNodeId,
        sortRuleName: parsed.sortRuleName,
        comments: parsed.comments,
        execOrder: parsed.execOrder,
        effDate: toDateOnly(parsed.effDate),
        expDate: parsed.expDate,
        spId: parsed.spId,

        bwfCondGroupList: mapCondGroupDetailToPayload(parsed.bwfCondGroupList),

        bwfActionList: mapActionDetailToPayload(parsed.bwfActionList),

        bwfSysAction: parsed.bwfSysAction,
      });
    } catch (error) {}
  };

  const onSubmit = async (data: CreateStepNodePayload) => {
    if (showDialog.mode === "update") {
      await UpdateStepNode(data);
    } else {
      await CreateStepNode(data);
    }
    handleClose();
  };

  useEffect(() => {
    if (showDialog.show) {
      if (showDialog.mode === "update" && StepNodeData) {
        getDetailData(StepNodeData.stepId);
      } else {
        reset((prev) => ({
          ...prev,
          nodeId: selectedStepNode.parentNodeId,
          execOrder: (selectedStepNode?.data?.execOrder ?? 0) + 1 || 1,
        }));
      }
    }
  }, [showDialog.show, selectedStepNode]);

  // useEffect(() => {
  // //  console.log("showDialog.mode: ", showDialog.mode);
  // }, [showDialog.mode]);
  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) => {
  //   //  console.log("Field changed:", name, "Type:", type, "Value:", value);
  //   });
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  return (
    <Dialog open={showDialog.show} onOpenChange={handleClose}>
      <DialogContent className="container-fixed max-w-[1200px] flex flex-col p-5 overflow-hidden [&>button]:hidden">
        {isLoading ? (
          // <Skeleton title="Fetching installment type detail" />
          <Loader title="Loading please wait..." />
        ) : (
          <>
            <DialogHeader className="p-5 border-0">
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
              <div className="flex flex-wrap items-center justify-between grow">
                <div className="flex flex-col justify-center">
                  <h1 className="text-xl font-semibold leading-none text-gray-900">
                    {showDialog.mode === "create" ? "Create" : "Update"} Step
                    Node
                  </h1>
                  <div className="flex items-center gap-2 text-sm font-normal text-gray-700"></div>
                </div>
                <div
                  className="opacity-50 cursor-pointer hover:opacity-100"
                  onClick={handleClose}
                >
                  <KeenIcon icon="cross" className="text-1.5xl" />
                </div>
              </div>
            </DialogHeader>
            <DialogBody className="px-0 pb-0 scrollable-y">
              <div className="flex flex-col px-0">
                <FormProvider {...form}>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="w-full space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <BuildFormRow label="Step Name" isRequired>
                          <Input
                            type="text"
                            placeholder="Enter Step Name"
                            {...register("sortRuleName")}
                          />
                        </BuildFormRow>
                        <BuildFormRow label="Start Time" isRequired>
                          <Input type="date" {...register("effDate")} />
                        </BuildFormRow>
                        <BuildFormRow label="End Time">
                          <Input type="date" {...register("expDate")} />
                        </BuildFormRow>
                      </div>

                      <div className="w-full">
                        <BuildFormRow label="Remarks">
                          <Input
                            type="text"
                            placeholder="Enter Remarks"
                            {...register("comments")}
                          />
                        </BuildFormRow>
                      </div>

                      {/* TABS */}
                      <div className="flex items-center justify-start">
                        {tabs.map((tab) => (
                          <div
                            key={tab.id}
                            className="flex items-center sborder-b flex-shrink-0"
                          >
                            <Button
                              type="button"
                              variant={"ghost"}
                              onClick={() => setActiveTab(tab.id)}
                              className={`text-sm font-semibold text-gray-600 px-4 py-2 border-b-2 rounded-none rounded-t-md transition-colors ${
                                activeTab === tab.id
                                  ? "border-red-500 text-red-600"
                                  : "border-transparent text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              {tab.label}
                            </Button>
                          </div>
                        ))}
                        {/* <PhasesTable
                        forms={methods}
                        setIsTotalOver={setIsTotalOver}
                      /> */}
                      </div>

                      <div className="w-full">
                        {activeTab === "expression" && (
                          <ConditionSection isCreating={isCreating} />
                        )}
                      </div>

                      <div className="w-full">
                        {activeTab === "result" && <ResultTab />}
                      </div>

                      <div className="flex justify-end pt-2.5 gap-5">
                        <Button
                          variant={"outline"}
                          type="button"
                          onClick={() => closeDialog()}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          // disabled={isSubmitting}
                          variant="default"
                          className={cn(
                            "bg-red-500 hover:bg-red-600",
                            isSubmitting && "cursor-not-allowed",
                          )}
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
                </FormProvider>
              </div>
            </DialogBody>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StepFormDialog;
