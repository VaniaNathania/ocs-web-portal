import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useEffect, useState, useCallback } from "react";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { toast } from "sonner";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createDefaultDiscountPayload,
  createDefaultReferenceObject,
  discountDetailSchema,
  discountPayloadSchema,
  validateDiscountPayload,
  type DiscountPayload,
} from "../types/form";
import z from "zod";
import TabularForm from "./TabularForm";
import { KeenIcon } from "@/components";
import ExpressionForm from "./ExpressionForm";
import { useDiscountPriceContext } from "../hooks";
import DeleteDialog from "../components/DeleteDialog";
import DiscountAPI from "../hooks/DiscountAPI";
import { Loader, LoadingOverlay } from "@/components/common/Loading";
import { XMLParser } from "fast-xml-parser";
import { useSyncGroupName } from "../hooks/form/useSyncGroupName";

const API_URL = apiConfig.service_price_plan;

interface AdditionalFormProps {
  isReference: boolean;
  isCalculation: boolean;
  isApplying: boolean;
}

interface ExpressionDiscount {
  scriptTempletId?: number | null;
  ruleComments?: string | null;
  ruleScript?: string | null;
  jsonScriptPage?: string | null;
}

const DiscountList = () => {
  const {  selectedOfferVerId  } = usePortalData();
  const { GetData, PostData, PutData, DeleteData } = useCallApi();
  const { GetAccountItemType, setDiscountTypeList, setDistributeMethodList } =
    useDiscountPriceContext();
  const { GetDiscountTypeList, GetDistributeMethod } = DiscountAPI();

  const methods = useForm<DiscountPayload>({
    resolver: zodResolver(discountPayloadSchema),
    defaultValues: createDefaultDiscountPayload(selectedOfferVerId || 0, "E"),
    mode: "onChange", // Enable real-time validation
  });

  const {
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isValid },
  } = methods;

  const [formType, setFormType] = useState<"create" | "update">("create");
  const [selectedDiscount, setSelectedDiscount] = useState<number | null>(null);
  const [discountList, setDiscountList] = useState<DiscountList[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<{
    show: boolean;
    selectedDelete: number | null;
  }>({
    show: false,
    selectedDelete: null,
  });
  const [selectedDelete, setSelectedDelete] = useState<number | null>(null);
  const [showReferenceObject, setShowReferenceObject] = useState(false);
  const [showCalculationObject, setShowCalculationObject] = useState(false);
  const [showApplyingObject, setShowApplyingObject] = useState(false);
  const [discountType, setDiscountType] = useState<"E" | "T">("E");

  const resetAdditionalForm = () => {
    setShowReferenceObject(false);
    setShowCalculationObject(false);
    setShowApplyingObject(false);
  };

  const [scriptToChange, setScriptToChange] = useState<string>("");

  const handleSelectEvent = (discount: DiscountList) => {
    setSelectedDiscount(discount.dpId);
    getDiscountDetail(discount.dpId);
  };

  const processExpressionDiscountData = useCallback(
    async (expressionDiscountData: any) => {
      try {
        const expressionData = Array.isArray(expressionDiscountData)
          ? expressionDiscountData[0]
          : expressionDiscountData;

        setScriptToChange(expressionData?.scriptPage || "");

        if (expressionData) {
          const {
            scriptTempletId,
            ruleComments,
            scriptPage,
            ruleScript: existingRuleScript,
          } = expressionData;

          let exprData: ExpressionDiscount | null = null;

          try {
            const parser = new XMLParser({
              ignoreAttributes: false,
              attributeNamePrefix: "",
            });
            const parsed = parser.parse(scriptPage || "<Properties/>");

            const props = parsed?.Properties?.Property || [];
            const items = parsed?.Properties?.value?.group?.item || [];
            const arrProps = Array.isArray(props) ? props : [props];
            const arrItems = Array.isArray(items) ? items : [items];

            const values: Record<string, string> = {};
            arrProps.forEach((p: any) => {
              const item = arrItems.find((i: any) => i.id === p.id);
              values[p.id] = (item?.value ?? p.defaultValue ?? "").toString();
            });

            const jsonScriptPage = scriptTempletId
              ? JSON.stringify([{ "": values }])
              : null;

            let ruleScript = "";

            if (scriptTempletId) {
              try {
                const tmplRes = await GetData(
                  `${API_URL}/script-templet/${scriptTempletId}`,
                  {}
                );
                const tmpl = tmplRes?.data;

                if (tmpl?.templetTypeScript) {
                  ruleScript = tmpl.templetTypeScript;
                  Object.entries(values).forEach(([k, v]) => {
                    const regex = new RegExp(
                      `&${k}&`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                      "g"
                    );
                    ruleScript = ruleScript.replace(regex, v);
                  });
                }
              } catch (tmplErr) {
                console.error("Failed to fetch script template:", tmplErr);
                ruleScript = existingRuleScript || "";
              }
            } else {
              ruleScript = existingRuleScript || "";
            }

            exprData = {
              scriptTempletId,
              ruleComments,
              ruleScript,
              jsonScriptPage,
            };
          } catch (parseError) {
            console.error("Expression discount parse error:", parseError);
            exprData = {
              scriptTempletId,
              ruleComments,
              ruleScript: existingRuleScript || "",
              jsonScriptPage: null,
            };
          }

          return exprData;
        }

        return null;
      } catch (error) {
        console.error("Failed to process expression discount data:", error);
        return null;
      }
    },
    [GetData]
  );
  const handleCreateNew = () => {
    setSelectedDiscount(null);
    reset(createDefaultDiscountPayload(selectedOfferVerId || 0, "E"));
    setFormType("create");
    setScriptToChange("");
    resetAdditionalForm();
  };

  const getDiscountDetail = async (discountId: number) => {
    setIsFetching(true);
    resetAdditionalForm();
    try {
      const response = await GetData(`${API_URL}/discount/qry-dp-by-pk`, {
        dpId: discountId,
        spId: 0,
      });

      if (response.status) {
        const detail = response.data[0];
        const processedExpressionData =
          await processExpressionDiscountData(detail);

        // Declare resetPayload outside the if blocks
        let resetPayload: DiscountPayload;

        if (detail.dpType === "E") {
          resetPayload = {
            ...createDefaultDiscountPayload(selectedOfferVerId || 0, "E"),
            offerVerId: selectedOfferVerId || 0,
            discountType: detail.dpType,
            discountName: detail.dpName || "",
            remarks: detail.comments || null,
            promotion: (detail.billingPlanType as "1" | "4") || "4",
            resultAccountItemType: detail.dpRuleAcctItemTypeId || null,
            dpRule: {
              scriptTempletId: detail.scriptTempletId || null,
              jsonScriptPage: detail.scriptPage || null,
              ruleScript: detail.ruleScript || null,
              remarks: detail.ruleComments || "",
            },
          };
        } else if (detail.dpType === "T") {
          resetPayload = {
            ...createDefaultDiscountPayload(selectedOfferVerId || 0, "T"),
            offerVerId: selectedOfferVerId || 0,
            discountType: detail.dpType,
            discountName: detail.dpName || "",
            remarks: detail.comments || null,
            promotion: (detail.billingPlanType as "1" | "4") || "4",
            resultAccountItemType: detail.resultAccountItemType || null,
            dpRule: {
              scriptTempletId: detail.scriptTempletId || null,
              jsonScriptPage: detail.scriptPage || null,
              ruleScript: detail.ruleScript || null,
              remarks: detail.ruleComments || "",
            },
          };
        } else {
          // Handle other discount types or throw an error
          throw new Error(`Unsupported discount type: ${detail.dpType}`);
        }

        reset(resetPayload);

        if (detail.dpType === "T") {
          await Promise.all([
            getDiscountDetailData(discountId),
            getTabularDetail(discountId),
          ]);
          setFormType("update");
        } else if (detail.dpType === "E") {
          setFormType("update");
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching discount detail:", error);
      toast.error("Something went wrong while fetching discount detail.");
    } finally {
      setIsFetching(false);
    }
  };

  const getDiscountDetailData = async (discountId: number) => {
    try {
      const response = await GetData(`${API_URL}/discount/qry-tab-dp-dt`, {
        dpId: discountId,
      });

      if (response.status) {
        const discountDetails = response.data.map((detail: any) => ({
          seqNo: detail.seqNo,
          disctCalcMethod: detail.disctCalcMethod,
          dpId: detail.dpId,
          sval: detail.sval,
          eval: detail.eval,
          discountValue: {
            refValue: detail.refValue ?? "",
            refCellValue: detail.refCellValue ?? "",
            refFloorValue: detail.refFloorValue ?? "",
          },
        }));

        setValue("discountDetail", discountDetails);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching discount detail.");
    }
  };

  const getTabularDetail = async (discountId: number) => {
    try {
      const response = await GetData(`${API_URL}/discount/qry-tab-dp-info`, {
        dpId: discountId,
        spId: 0,
      });

      if (!response.status) {
        toast.error(response.message);
        return;
      }

      const detail = (response.data[0] ?? {}) as TabularDetailApi;

      setValue("tabDiscountType", detail.tabDpType);
      setValue("distributeMethod", detail.distributeMethod);
      setValue("negativeResult", detail.negativeFlag);
      setValue(
        "resultAccountItemType",
        detail.acctItemTypeId !== -1 ? detail.acctItemTypeId : null
      );

      const tasks: Promise<void>[] = [];

      if (detail.refDisctObjId !== -1) {
        setShowReferenceObject(true);
        setValue("referenceObject", createDefaultReferenceObject());
        tasks.push(
          (async () => {
            await getMappingAcctItemDetail(
              "referenceObject",
              detail.refDisctObjId
            );
            setValue("referenceObject.objectName", detail.refDisctObjName);
            setValue("referenceObject.objectType", detail.refDisctObjType);
            setValue("referenceObject.memberAlias", detail.refMemberAlias);
          })()
        );
      }
      if (detail.refTabDpCondGrpId !== -1) {
        tasks.push(
          getConditionDetail("referenceObject", detail.refTabDpCondGrpId)
        );
      }

      if (detail.calcDisctObjId !== -1) {
        setShowCalculationObject(true);
        setValue("calculationObject", createDefaultReferenceObject());
        tasks.push(
          (async () => {
            await getMappingAcctItemDetail(
              "calculationObject",
              detail.calcDisctObjId
            );
            setValue("calculationObject.objectName", detail.calcDisctObjName);
            setValue("calculationObject.objectType", detail.calcDisctObjType);
            setValue("calculationObject.memberAlias", detail.calcMemberAlias);
          })()
        );
      }
      if (detail.calcTabDpCondGrpId !== -1) {
        tasks.push(
          getConditionDetail("calculationObject", detail.calcTabDpCondGrpId)
        );
      }

      if (detail.applyDisctObjId !== -1) {
        setShowApplyingObject(true);
        setValue("applyingObject", createDefaultReferenceObject());
        tasks.push(
          (async () => {
            await getMappingAcctItemDetail(
              "applyingObject",
              detail.applyDisctObjId
            );
            setValue("applyingObject.objectName", detail.applyDisctObjName);
            setValue("applyingObject.objectType", detail.applyDisctObjType);
            setValue("applyingObject.memberAlias", detail.applyMemberAlias);
          })()
        );
      }
      if (detail.applyTabDpCondGrpId !== -1) {
        tasks.push(
          getConditionDetail("applyingObject", detail.applyTabDpCondGrpId)
        );
      }

      if (detail.tabDpCondGrpId !== -1) {
        tasks.push(getConditionDetail("discount", detail.tabDpCondGrpId));
      }

      await Promise.all(tasks);
    } catch (error) {
      toast.error("Something went wrong while fetching tabular details.");
    }
  };

  const getMappingAcctItemDetail = async (
    fieldName: "referenceObject" | "calculationObject" | "applyingObject",
    refDisctObjId: number
  ) => {
    try {
      const response = await GetData(`${API_URL}/discount/qry-disct-obj-info`, {
        disctObjId: refDisctObjId,
        spId: 0,
      });

      if (response.status) {
        const mapped = response.data.map((item: any) => ({
          priority: item.priority,
          acctItemTypeId: item.acctItemTypeId,
        }));

        setValue(`${fieldName}.mappingAccountItemTypes`, mapped);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(
        "Something went wrong while fetching mapping account item details."
      );
    }
  };

  const getConditionDetail = async (
    fieldName:
      | "discount"
      | "referenceObject"
      | "calculationObject"
      | "applyingObject",
    tabDpCondGrpId: number
  ) => {
    try {
      const response = await GetData(
        `${API_URL}/discount/qry-tab-dp-cond-grp-dt`,
        {
          tabDpCondGrpId,
          spId: 0,
        }
      );

      if (response.status) {
        const mapped = response.data.map((item: any) => ({
          grpId: item.grpId,
          seqNo: item.seqNo,
          ldpRefCondId: item.ldpRefCondId,
          sortOperator: item.sortOperator,
          lparam1: String(item.lparam1),
          rval: item.rval,
        }));

        if (fieldName === "discount") {
          setValue(`insertDiscountConditionGroup`, mapped);
        } else {
          setValue(
            `${
              fieldName as
                | "referenceObject"
                | "calculationObject"
                | "applyingObject"
            }.insertDiscountConditionGroup`,
            mapped
          );
        }
      }
    } catch (error) {
      toast.error("Something went wrong while fetching condition details.");
    }
  };

  const GetDiscountList = async (offerVerId: number) => {
    setIsLoading(true);
    try {
      const response = await GetData(`${API_URL}/discount/dp/list`, {
        offerVerId,
      });

      if (response.status) {
        setDiscountList(response.data || []);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Something went wrong while fetching discount list.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: DiscountPayload) => {
    const result = validateDiscountPayload(data);

    if (!result.success) {
      console.error("Validation errors:", result.error?.format());
      toast.error("Please fix validation errors before submitting");
      return;
    }

    if (formType === "create") {
      await doCreateDiscount(data);
    } else if (formType === "update") {
      await doUpdateDiscount(data);
    }
  };

  const doCreateDiscount = async (data: DiscountPayload) => {
    setIsSubmitting(true);
    try {
      const response = await PostData(`${API_URL}/discount/create`, data);

      if (response?.status) {
        toast.success(response.message);
        scrollToTop();
        if (selectedOfferVerId) {
          await GetDiscountList(selectedOfferVerId || 0);
        }
        reset(
          createDefaultDiscountPayload(selectedOfferVerId || 0, discountType)
        );
        setScriptToChange("");
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Something went wrong while creating discount.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const doUpdateDiscount = async (data: DiscountPayload) => {
    setIsSubmitting(true);
    try {
      const response = await PutData(
        `${API_URL}/discount/update?id=${selectedDiscount}`,
        data
      );

      if (response?.status) {
        toast.success(response.message);
        scrollToTop();
        await GetDiscountList(selectedOfferVerId || 0);
        if (selectedOfferVerId && selectedDiscount) {
          await getDiscountDetail(selectedDiscount);
        }
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Something went wrong while updating discount.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const doDeleteDiscount = async (discountId: number) => {
    setIsSubmitting(true);
    try {
      const response = await DeleteData(
        `${API_URL}/discount/dp/delete?id=${discountId}`,
        {}
      );

      if (response?.status) {
        toast.success(response.message);
        if (selectedOfferVerId) {
          await GetDiscountList(selectedOfferVerId || 0);
        }
        setShowDeleteDialog({
          show: false,
          selectedDelete: null,
        });
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Something went wrong while deleting discount.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToTop = (behavior: ScrollBehavior = "smooth") => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: behavior,
    });
  };

  useEffect(() => {
    GetAccountItemType();
  }, []);

  useEffect(() => {
    if (discountType === "E") {
      reset(createDefaultDiscountPayload(selectedOfferVerId || 0, "E"));
      // setValue("discountType", "E");
    } else {
      reset(createDefaultDiscountPayload(selectedOfferVerId || 0, "T"));
      // setValue("discountType", "T");
    }
  }, [discountType]);

  useEffect(() => {
    let mounted = true;

    const fetchList = async () => {
      try {
        const [discountTypeRes, distributeMethodRes] = await Promise.all([
          GetDiscountTypeList(),
          GetDistributeMethod(),
        ]);

        if (mounted) {
          if (discountTypeRes?.status) {
            setDiscountTypeList(discountTypeRes.data ?? []);
          }
          if (distributeMethodRes?.status) {
            setDistributeMethodList(distributeMethodRes.data ?? []);
          }
        }
      } catch (e) {
        console.error("Failed fetching data:", e);
      }
    };

    fetchList();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedOfferVerId) {
      setValue("offerVerId", selectedOfferVerId || 0);
      GetDiscountList(selectedOfferVerId || 0);
    }
  }, [selectedOfferVerId]);

  return (
    <>
      <DeleteDialog
        showDeleteConfirm={showDeleteDialog}
        setShowDeleteConfirm={setShowDeleteDialog}
        doDeleteDiscount={doDeleteDiscount}
        isSubmitting={isSubmitting}
      />

      <div className="relative min-h-screen p-4 bg-gray-50">
        {isSubmitting && <LoadingOverlay />}
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormProvider {...methods}>
            <div className="flex min-h-screen border border-gray-200 rounded shadow-sm">
              {/* Discount List */}
              <div className="w-1/4 p-3 bg-white border-r border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="mb-3 text-sm font-semibold">Discount List</h2>
                  <button
                    type="button"
                    className="text-lg font-bold text-red-500 transition-colors hover:text-red-700"
                    title="Add New Discount"
                    onClick={handleCreateNew}
                  >
                    +
                  </button>
                </div>
                <ul>
                  {isLoading ? (
                    <Loader title="Loading Discount List" />
                  ) : discountList.length > 0 ? (
                    discountList.map((discount) => {
                      const isActive = selectedDiscount === discount.dpId;
                      return (
                        <li
                          key={discount.dpId}
                          onClick={() => handleSelectEvent(discount)}
                          className={`py-2 px-3 mb-1 rounded cursor-pointer transition group relative ${
                            isActive
                              ? "bg-red-100 text-red-600 font-semibold"
                              : "hover:bg-gray-100"
                          } flex justify-between items-center`}
                        >
                          <span className="flex-1 pr-2">{discount.dpName}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteDialog({
                                show: true,
                                selectedDelete: discount.dpId,
                              });
                            }}
                            className="text-red-500 transition-all duration-300 ease-in-out transform translate-x-full opacity-0 hover:text-red-700 group-hover:translate-x-0 group-hover:opacity-100"
                          >
                            <KeenIcon icon="trash" />
                          </button>
                        </li>
                      );
                    })
                  ) : (
                    <div className="p-5 text-sm text-center text-gray-500">
                      No discount to view
                    </div>
                  )}
                </ul>
              </div>

              {/* Form Section */}
              {isFetching ? (
                <div className="flex justify-center w-3/4 h-full min-h-[300px] mt-10">
                  <Loader title="Loading Data Details" />
                </div>
              ) : watch("discountType") === "E" ? (
                <ExpressionForm
                  forms={methods}
                  isSubmitting={isSubmitting}
                  formType={formType}
                  scriptToChange={scriptToChange}
                  setDiscountType={setDiscountType}
                />
              ) : (
                <TabularForm
                  forms={methods}
                  isSubmitting={isSubmitting}
                  formType={formType}
                  AdditionalForm={{
                    isReference: showReferenceObject,
                    isApplying: showApplyingObject,
                    isCalculation: showCalculationObject,
                    setIsReference: setShowReferenceObject,
                    setIsApplying: setShowApplyingObject,
                    setIsCalculation: setShowCalculationObject,
                  }}
                  setDiscountType={setDiscountType}
                />
              )}
            </div>
          </FormProvider>
        </form>
      </div>
    </>
  );
};

export default DiscountList;
