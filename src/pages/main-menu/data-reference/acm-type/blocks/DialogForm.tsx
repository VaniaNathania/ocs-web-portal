import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAccmTypeStore } from "../stores/accmType.store";
import { toast } from "sonner";
import {
  AccmTypeForm,
  AccmTypeSchema,
  initialForm,
} from "../schema/accmType.schema";
import { useCallback, useEffect, useState } from "react";
import AccumulationCalculation from "./AddAccmTypeDialog/AccumulationCalculation";
import Accumulation from "./AddAccmTypeDialog/Accumulation";
import AccumulationPrice from "./AddAccmTypeDialog/AccumulationPrice";
import AccumulationTrigger from "./AddAccmTypeDialog/AccumulationTrigger";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PricePlanService } from "@/common/api/price-plan/endpoints";
import { useAccumulationApi } from "../api/useAccumulationApi";
import { ROUND_WAY_OPTIONS } from "../hooks/types";
import { useCallApi } from "@/hooks";
import { Loader } from "@/components/common/Loading";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

interface loadingState {
  option: boolean;
  tableData: boolean;
}

const DialogForm = () => {
  const {
    showDialog,
    selectedAccmType,
    closeDialog,
    isSubmitting,
    setIsSubmitting,
    triggerReload,
    menuPrivAccess,
  } = useAccmTypeStore();
  const tabs = [
    { id: "detail", label: "Detail" },
    { id: "calculation", label: "Accumulation Calculation" },
    { id: "price", label: "Accumulation Price" },
    { id: "accumulation", label: "Accumulation" },
    { id: "trigger", label: "Accumulation Trigger" },
  ];

  const { GET_REATTR, GET_UNIT_TYPE } = PricePlanService();
  const {
    getDetailAccumulation,
    getDetailTriggerAccumulation,
    getDetailAccumulationPrice,
    getDetailAccumulationCalculation,
    getAccumulationModeOption,
    createAccumulationType,
    updateAccumulationType,
  } = useAccumulationApi();

  const isEdit = showDialog.mode === "update";
  const createMode =
    showDialog.mode === "create"
      ? tabs.filter((detail) => detail.id === "detail")
      : tabs;

  const [activeTab, setActiveTab] = useState("detail");
  const [meaFeature, setMeaFeature] = useState<MeasurementFeature[]>([]);
  const [unitType, setUnitType] = useState<unitType[]>([]);
  const [accmMode, setAccmMode] = useState<AccmMode[]>([]);
  const [clearRoundWay, setClearRoundWay] = useState(ROUND_WAY_OPTIONS);
  const [loading, setLoading] = useState<loadingState>({
    option: false,
    tableData: false,
  });
  // const [tabsAccumulation, setTabsAccumulation] = useState<
  //   InitDetailAccumulation[]
  // >([]);
  // const [tabsAccmTrigger, setTabsAccmTrigger] = useState<
  //   InitDetailTriggerAccumulation[]
  // >([]);
  // const [tabsAccmPrice, setTabsAccmPrice] = useState<InitDetailAccmPrice[]>([]);
  // const [tabsAccmCalculation, setTabsAccmCalculation] = useState<
  //   InitDetailAccmCalculation[]
  // >([]);

  const [tabsAccm, setTabsAccm] = useState({
    accumulation: [] as InitDetailAccumulation[],
    trigger: [] as InitDetailTriggerAccumulation[],
    calculation: [] as InitDetailAccmCalculation[],
    price: [] as InitDetailAccmPrice[],
  });

  const form = useForm<AccmTypeForm>({
    resolver: zodResolver(AccmTypeSchema),
    defaultValues: initialForm(),
  });

  const { errors } = form.formState;

  const onSubmit = async (data: AccmTypeForm) => {
    setIsSubmitting(true);
    try {
      if (isEdit && selectedAccmType) {
        // const payload = {
        //   ...data,
        //   resourceId: selectedAccmType.resourceId
        // }

        // update
        const response = await updateAccumulationType(data);

        if (response?.status) {
          toast.success("Success");
          closeDialog();
          triggerReload();
        } else {
          toast.error("Name same please Check field");
        }
      } else {
        //create
        const response = await createAccumulationType(data);
        if (response?.status) {
          toast.success("Success");
          closeDialog();
          triggerReload();
        } else {
          toast.error("Name same please Check field");
        }
      }
    } catch (error) {
      toast.error("Please Check field");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const onSubmit = useCallback(
  //   async (data: AccmTypeForm) => {
  //     setIsSubmitting(true);
  //     try {
  //       const action = isEdit ? updateAccumulationType : createAccumulationType;
  //       const response = await action(data);

  //       if (response?.status) {
  //         toast.success("Success");
  //         closeDialog();
  //         triggerReload();
  //       } else {
  //         toast.error("Name Already Exist, Please Check the field");
  //       }
  //     } catch (error) {
  //       toast.error("Please check all Required fields");
  //     } finally {
  //       setIsSubmitting(false);
  //     }
  //   },
  //   [
  //     isEdit,
  //     updateAccumulationType,
  //     createAccumulationType,
  //     closeDialog,
  //     triggerReload,
  //     setIsSubmitting,
  //   ]
  // );

  const fetchMeaFeature = async () => {
    try {
      const response = await GET_REATTR();
      if (response?.data) {
        setMeaFeature(response.data);
      }
    } catch (error) {
      toast.error("Error Get Type Data");
    }
  };

  const fetchAccmMode = async () => {
    try {
      const response = await getAccumulationModeOption();
      if (response?.data) {
        setAccmMode(response.data);
      }
    } catch (error) {
      toast.error("Error Get Type Data");
    }
  };
  const fetchUnitType = async () => {
    try {
      const response = await GET_UNIT_TYPE();
      if (response?.data) {
        setUnitType(response.data);
      }
    } catch (error) {
      toast.error("Error Get Type Data");
    }
  };

  // const fetchTabsAccumulation = async () => {
  //   try {
  //     const response = await getDetailAccumulation(
  //       Number(selectedAccmType?.resourceId) || 0
  //     );

  //     if (response.data) {
  //       setTabsAccumulation(response.data);
  //     }
  //   } catch (error) {
  //     toast.error("Error loading accumulation data");
  //   }
  // };
  // const fetchTabsAccmTrigger = async () => {
  //   try {
  //     const response = await getDetailTriggerAccumulation(
  //       selectedAccmType?.resourceId || 0
  //     );
  //     if (response.data) {
  //       setTabsAccmTrigger(response.data);
  //     }
  //   } catch (error) {
  //     toast.error("Error loading accumulation data");
  //   }
  // };
  // const fetchTabsAccmPrice = async () => {
  //   try {
  //     const response = await getDetailAccumulationPrice(
  //       selectedAccmType?.resourceId || 0
  //     );
  //     if (response.data) {
  //       setTabsAccmPrice(response.data);
  //     }
  //   } catch (error) {
  //     toast.error("Error loading accumulation data");
  //   }
  // };
  // const fetchTabsAccmCalculation = async () => {
  //   try {
  //     const response = await getDetailAccumulationCalculation(
  //       selectedAccmType?.resourceId || 0
  //     );
  //     if (response.data) {
  //       setTabsAccmCalculation(response.data);
  //     }
  //   } catch (error) {
  //     toast.error("Error loading accumulation data");
  //   }
  // };

  const fetchAllTabs = useCallback(async (): Promise<void> => {
    if (!selectedAccmType?.resourceId) return;
    try {
      const [accumulation, trigger, price, calculation] = await Promise.all([
        getDetailAccumulation(Number(selectedAccmType.resourceId)),
        getDetailTriggerAccumulation(selectedAccmType.resourceId),
        getDetailAccumulationPrice(selectedAccmType.resourceId),
        getDetailAccumulationCalculation(selectedAccmType.resourceId),
      ]);

      setTabsAccm({
        accumulation: accumulation.data || [],
        trigger: trigger.data || [],
        price: price.data || [],
        calculation: calculation.data || [],
      });
    } catch (error) {
      toast.error("Error Loading Fetch Data");
    }
  }, [
    selectedAccmType?.resourceId,
    getDetailAccumulation,
    getDetailTriggerAccumulation,
    getDetailAccumulationPrice,
    getDetailAccumulationCalculation,
  ]);

  // useEffect(() => {
  //   if (showDialog.show) {
  //     fetchMeaFeature();
  //     fetchUnitType();
  //     fetchAccmMode();
  //     if (showDialog.mode === "update" && selectedAccmType) {
  //       form.reset({
  //         ...selectedAccmType,
  //         reAttr: selectedAccmType.ratableResourceReAttr,
  //         spId: 0,
  //       });
  //       // fetchTabsAccumulation();
  //       // fetchTabsAccmTrigger();
  //       // fetchTabsAccmPrice();
  //       // fetchTabsAccmCalculation();
  //       fetchAllTabs();
  //     }
  //   }
  // }, [showDialog.show, showDialog.mode]);

  useEffect(() => {
    const fetchOptionList = async () => {
      setLoading((prev) => ({ ...prev, option: true }));
      try {
        await Promise.all([
          fetchMeaFeature(),
          fetchUnitType(),
          fetchAccmMode(),
        ]);
      } catch (error) {
        toast.error("Error Get Option List, Please Check Your Connection!");
      } finally {
        setLoading((prev) => ({ ...prev, option: false }));
      }
    };

    const fetchTabsTable = async () => {
      setLoading((prev) => ({ ...prev, option: true }));
      try {
        await fetchAllTabs();
        //  console.log("hadeeeeh", tabsAccm);
      } catch (error) {
        toast.error("Error Get Option List, Please Check Your Connection!");
      } finally {
        setLoading((prev) => ({ ...prev, option: false }));
      }
    };

    const InitDialog = async () => {
      if (showDialog.show) {
        await fetchOptionList();
      }

      if (showDialog.mode === "update" && selectedAccmType) {
        form.reset({
          ...selectedAccmType,
          reAttr: selectedAccmType.ratableResourceReAttr,
          spId: 0,
        });
        await fetchTabsTable();
      }
    };
    InitDialog();
  }, [showDialog.show, showDialog.mode, selectedAccmType]);

  const handleCloseDialog = () => {
    setActiveTab("detail");
    form.reset(initialForm());
    closeDialog();
  };
  `1`;

  return (
    <Dialog open={showDialog.show} onOpenChange={handleCloseDialog}>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[90vh] p-0 gap-0 flex flex-col h-full overflow-hidden ">
        {/* HEADER */}
        <DialogHeader className="p-6 border-b flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">
            {isEdit ? "Edit Accumulation Type" : "Create Accumulation Type"}
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="overflow-scroll">
          {loading.option || loading.tableData ? (
            <div className="flex justify-center h-full min-h-[300px] mt-10">
              <Loader title="Loading"></Loader>
            </div>
          ) : (
            <>
              <div className="flex border-b flex-shrink-0">
                {createMode.map((tab) => (
                  <Button
                    key={tab.id}
                    type="button"
                    variant="ghost"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 rounded-none transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* FORM */}
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col flex-1 min-h-0"
              >
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {activeTab === "detail" && (
                    <div className="space-y-8 mt-4">
                      {/* Row 1 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <span className="text-red-500">*</span> Accumulation
                            Type Name
                          </label>
                          <Input
                            {...form.register("resourceName")}
                            placeholder="Enter Accumulation Type Name"
                            className="w-full"
                          />
                          {form.formState.errors.resourceName && (
                            <p className="text-red-500 text-xs mt-1">
                              {form.formState.errors.resourceName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <span className="text-red-500">*</span> Accumulation
                            Mode
                          </label>
                          <Controller
                            name="acmType"
                            control={form.control}
                            render={({ field }) => (
                              <Select
                                onValueChange={(val) => field.onChange(val)}
                                value={field.value ?? ""}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Accmulation Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                  {accmMode.map((type) => (
                                    <SelectItem key={type.id} value={type.id}>
                                      {type.acmTypeName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />

                          {errors.acmType && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.acmType.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <span className="text-red-500">*</span> Accumulation
                            Mask
                          </label>
                          <Input
                            {...form.register("mask")}
                            placeholder="Enter Accumulation Mask"
                            className="w-full"
                          />
                          {form.formState.errors.mask && (
                            <p className="text-red-500 text-xs mt-1">
                              {form.formState.errors.mask.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Row 2 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Type
                          </label>
                          <div className="flex items-center gap-2">
                            <Controller
                              name="unitTypeId"
                              control={form.control}
                              render={({ field }) => (
                                <>
                                  <Select
                                    onValueChange={(val) =>
                                      field.onChange(Number(val))
                                    }
                                    // value={String(field.value)}
                                    value={
                                      field.value === null
                                        ? ""
                                        : field.value.toString()
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select Unit Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {unitType.map((type) => (
                                        <SelectItem
                                          key={type.unitTypeId}
                                          value={String(type.unitTypeId)}
                                        >
                                          {type.unitTypeName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {Number(field.value) > 0 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="hover:bg-gray-300 hover:text-black"
                                      onClick={() => {
                                        field.onChange(null);
                                      }}
                                    >
                                      X
                                    </Button>
                                  )}
                                </>
                              )}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit Precision
                          </label>
                          <Input
                            type="number"
                            {...form.register("unitPrecision", {
                              setValueAs: (value) => {
                                if (!value) return null;
                                return Number(value);
                              },
                            })}
                            placeholder="Enter Unit Precision "
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <span className="text-red-500">*</span> Measurement
                            Feature
                          </label>
                          <Controller
                            name="reAttr"
                            control={form.control}
                            render={({ field }) => (
                              <Select
                                onValueChange={(val) =>
                                  field.onChange(Number(val))
                                }
                                value={
                                  field.value === 0
                                    ? undefined
                                    : field.value.toString()
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Measurement Feature" />
                                </SelectTrigger>
                                <SelectContent>
                                  {meaFeature.map((type) => (
                                    <SelectItem
                                      key={type.id}
                                      value={String(type.id)}
                                    >
                                      {type.reAttrName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.reAttr && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.reAttr.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Row 3 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Round Way
                          </label>
                          <div className="flex items-center gap-2">
                            <Controller
                              name="roundWay"
                              control={form.control}
                              render={({ field }) => (
                                <>
                                  <Select
                                    onValueChange={(val) => {
                                      field.onChange(val || null);
                                    }}
                                    value={
                                      field.value === null
                                        ? ""
                                        : field.value.toString()
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ROUND_WAY_OPTIONS.map((opt) => (
                                        <SelectItem
                                          key={opt.value}
                                          value={opt.value.toString()}
                                        >
                                          {opt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {Number(field.value) > 0 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      className="hover:bg-gray-300 hover:text-black"
                                      onClick={() => {
                                        field.onChange(null);
                                      }}
                                    >
                                      X
                                    </Button>
                                  )}
                                </>
                              )}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precision
                          </label>
                          <Input
                            type="number"
                            {...form.register("precision", {
                              setValueAs: (value) => {
                                if (!value) return null;

                                return Number(value);
                              },
                            })}
                            placeholder="Enter Precision"
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Remarks
                        </label>
                        <Controller
                          name="comments"
                          control={form.control}
                          render={({ field }) => (
                            <textarea
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                field.onChange(
                                  value.trim() === "" ? null : value,
                                );
                              }}
                              className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                              placeholder="Enter remarks......."
                            />
                          )}
                        />
                      </div>
                      <div className="flex justify-end gap-2 px-6 py-4 border-t flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCloseDialog}
                        >
                          Cancel
                        </Button>
                        <AccessWrapper
                          hasAccess={
                            showDialog.mode === "create"
                              ? menuPrivAccess.addStatus
                              : menuPrivAccess.editStatus
                          }
                        >
                          <Button type="submit" disabled={isSubmitting}>
                            {isEdit ? "Update" : "Create"}
                          </Button>
                        </AccessWrapper>
                      </div>
                    </div>
                  )}
                </div>
              </form>
              {/* Tab Contents */}
              {activeTab === "calculation" && (
                <AccumulationCalculation data={tabsAccm.calculation} />
              )}
              {activeTab === "price" && (
                <AccumulationPrice data={tabsAccm.price} />
              )}
              {activeTab === "accumulation" && (
                <Accumulation data={tabsAccm.accumulation} />
              )}
              {activeTab === "trigger" && (
                <AccumulationTrigger data={tabsAccm.trigger} />
              )}
            </>
          )}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default DialogForm;
