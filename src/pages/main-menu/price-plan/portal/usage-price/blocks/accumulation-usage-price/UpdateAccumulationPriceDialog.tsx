import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  Typography,
} from "@mui/material";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useUsagePriceCreateContext } from "../../hooks";
import TimeSpanUpdateComponent, {
  TimeSpanUpdateAccumulation,
} from "./update-sub/TimeSpanComponent";
import ReferenceUpdateAccumulationComponent, {
  ReferenceUpdateAccumulation,
} from "./update-sub/RefrenceAccumulationComponent";
import ExpressionPriceComponent, {
  ExpressionPrice,
} from "./update-sub/ExpressionPriceComponent";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { XMLParser } from "fast-xml-parser";

interface UpdateAccumulationPriceVersionDialogProps {
  onClose: () => void;
  show: boolean;
  priceId: number | null;
  priceVerId: number | null;
  onUpdateSuccess?: () => void;
}

interface AccumulationFormData {
  offerVerId: number;
  ratePlanId: number;
  priceVerId: number;
  priceId: number;
  effDate: string;
  expDate: string;
  resourceId: number;
  reAttr: number;
  calculateUnit: number;
  accumulation: string;
  remarks: string;
  timeSpanAccumulation: TimeSpanUpdateAccumulation[] | null;
  referenceAccumulation: ReferenceUpdateAccumulation[] | null;
  expressionPrice: ExpressionPrice | null;
}

interface AccumulationListVersion {
  resourceId: number;
  resourceName: string;
  reAttrId: number;
  reAttrName: string;
}

const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

const UpdateAccumulationPriceDialog: React.FC<
  UpdateAccumulationPriceVersionDialogProps
> = ({ onClose, show, priceId, priceVerId, onUpdateSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentPriceVerId, setCurrentPriceVerId] = useState<number>(0);

  const { GetData, PutData } = useCallApi();
  const { selectedRatePlan } = useUsagePriceCreateContext();
  const {  selectedOfferVerId  } = usePortalData();

  const [accu, setAccu] = useState<AccumulationListVersion[]>([]);
  const [selectedAccumulationType, setSelectedAccumulationType] =
    useState<number>(0);

  const [scriptToChange, setScriptToChange] = useState<string>("");

  const [formField, setFormField] = useState<AccumulationFormData>({
    offerVerId: selectedOfferVerId || 0,
    ratePlanId: selectedRatePlan || 0,
    priceVerId: 0,
    priceId: 0,
    effDate: "",
    expDate: "",
    resourceId: 0,
    reAttr: 0,
    calculateUnit: 0,
    accumulation: "",
    remarks: "",
    timeSpanAccumulation: [],
    referenceAccumulation: [],
    expressionPrice: null,
  });

  // Fetch accumulation type list
  useEffect(() => {
    const getAccumulationList = async () => {
      try {
        const response = await GetData(
          `${API_URL_PRICE_PLAN}/price/accumulation-type/list`,
          {}
        );
        setAccu(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch accumulation list:", error);
      }
    };
    getAccumulationList();
  }, [GetData]);

  // Fetch detail data
  useEffect(() => {
    const fetchAllDetail = async () => {
      if (!priceId) return; // FIX: hanya cek priceId
      setIsLoadingData(true);
      try {
        // 1. Basic accumulation detail
        const accuRes = await GetData(
          `${API_URL_PRICE_PLAN}/price/accumulation/list`,
          { priceId }
        );
        const accuData = accuRes?.data?.[0];

        // 2. Time span
        const timeSpanRes = await GetData(
          `${API_URL_PRICE_PLAN}/price/acm-time-span/list`,
          { priceVerId, spId: 0 }
        );
        const timeSpanData = (timeSpanRes?.data || []).map((item: any) => ({
          timeSpanId: item.timeSpanId,
          calculationMethod: item.adjustMethod,
          valueString: item.valueString.toString(),
          calculationUnit: item.rum,
          priority: item.priority,
          timeSpanName: item.timeSpanName,
        }));

        // 3. Reference
        const refRes = await GetData(
          `${API_URL_PRICE_PLAN}/price/acm-ref/list`,
          { priceVerId, spId: 0 }
        );
        const refData = (refRes?.data || []).map((item: any) => ({
          acmTimeSpanId: item.acmTimeSpanPriority,
          effValue: item.effValue,
          expValue: item.expValue,
          resourceId: item.resourceId,
          calculationMethod: item.adjustMethod,
          accumulation: item.rate.toString(),
          calculateUnit: item.rum,
        }));

        // 4. Expression
        const exprRes = await GetData(
          `${API_URL_PRICE_PLAN}/price/acm-expression/list`,
          { priceVerId, spId: 0 }
        );

        let exprData: ExpressionPrice | null = null;
        setScriptToChange(exprRes?.data?.scriptPage || "");

        if (exprRes?.data) {
          const {
            scriptTempletId,
            ruleComments,
            scriptPage,
            ruleScript: existingRuleScript,
          } = exprRes.data;

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
                  `${API_URL_PRICE_PLAN}/script-templet/${scriptTempletId}`,
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
              }
            } else {
              ruleScript = existingRuleScript || "";
            }

            exprData = {
              scriptTempletId,
              ruleComment: ruleComments,
              ruleScript,
              jsonScriptPage,
            };
          } catch (parseError) {
            console.error("Parse expression failed:", parseError);
            exprData = {
              scriptTempletId,
              ruleComment: ruleComments,
              ruleScript: existingRuleScript || "",
              jsonScriptPage: null,
            };
          }
        }

        if (accuData) {
          setCurrentPriceVerId(accuData.priceVerId);
          setFormField({
            offerVerId: accuData.offerVerId,
            ratePlanId: accuData.ratePlanId,
            priceVerId: accuData.priceVerId,
            priceId: accuData.priceId,
            effDate: accuData.effDate,
            expDate: accuData.expDate,
            resourceId: accuData.resourceId,
            reAttr: accuData.reAttr,
            calculateUnit: accuData.rum,
            accumulation: accuData.accumulation,
            remarks: accuData.comments || "",
            timeSpanAccumulation: timeSpanData,
            referenceAccumulation: refData,
            expressionPrice: exprData,
          });
          setSelectedAccumulationType(accuData.resourceId);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load update data");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (show) {
      fetchAllDetail();
    }
  }, [show, priceId, priceVerId, GetData]);

  const handleAccumulationTypeChange = (resourceId: number) => {
    setSelectedAccumulationType(resourceId);
    const selectedAccu = accu.find((item) => item.resourceId === resourceId);
    if (selectedAccu) {
      setFormField((prev) => ({
        ...prev,
        resourceId: selectedAccu.resourceId,
        reAttr: selectedAccu.reAttrId,
      }));
    }
  };

  const doUpdateAccumulationPrice = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const submitData = {
        ...formField,
        timeSpanAccumulation: formField.timeSpanAccumulation?.length
          ? formField.timeSpanAccumulation
          : null,
        referenceAccumulation: formField.referenceAccumulation?.length
          ? formField.referenceAccumulation
          : null,
      };

      const response = await PutData(
        `${API_URL_PRICE_PLAN}/price/accumulation/update`,
        submitData
      );
      if (response?.status) {
        toast.success("Accumulation price successfully updated!");
        onUpdateSuccess?.();
        onClose();
      } else {
        toast.error("Failed to update accumulation price");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while updating accumulation price"
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [formField, PutData, onClose, onUpdateSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doUpdateAccumulationPrice();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const selectedAccuItem = accu.find(
    (item) => item.resourceId === selectedAccumulationType
  );

  return (
    <Dialog
      open={show}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          backgroundColor: "white",
          borderRadius: 2,
          height: "90vh",
        },
      }}
    >
      <DialogTitle className="text-lg font-semibold text-gray-900 border-b border-gray-200">
        Update Accumulation Price
      </DialogTitle>

      <DialogContent className="p-0 overflow-hidden">
        {isLoadingData ? (
          <div className="flex justify-center items-center p-8">
            <CircularProgress />
            <Typography className="ml-2">
              Loading accumulation data...
            </Typography>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="overflow-y-auto">
              {/* Basic Information Section */}
              <div className="p-3 border-b bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                      Effective Date
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-2 py-1 text-xs border rounded focus:outline-none transition-colors border-gray-200 focus:border-blue-500"
                      type="date"
                      value={formField.effDate}
                      onChange={(e) => {
                        setFormField({
                          ...formField,
                          effDate: e.target.value,
                        });
                      }}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Expiry Date
                    </label>
                    <input
                      className="w-full px-2 py-1 text-xs border rounded focus:outline-none transition-colors border-gray-200 focus:border-blue-500"
                      type="date"
                      value={formField.expDate}
                      onChange={(e) => {
                        setFormField({
                          ...formField,
                          expDate: e.target.value,
                        });
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                      Accumulation Type
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-2 py-1 text-xs border rounded focus:outline-none transition-colors border-gray-200 focus:border-blue-500"
                      value={selectedAccumulationType || ""}
                      onChange={(e) =>
                        handleAccumulationTypeChange(
                          parseInt(e.target.value) || 0
                        )
                      }
                      required
                    >
                      <option value="">Select accumulation type</option>
                      {accu.map((item) => (
                        <option key={item.resourceId} value={item.resourceId}>
                          {item.resourceName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                      Event Change
                    </label>
                    <input
                      className="w-full px-2 py-1 text-xs border rounded focus:outline-none transition-colors border-gray-200 bg-gray-50"
                      type="text"
                      value={
                        selectedAccuItem ? `${selectedAccuItem.reAttrName}` : ""
                      }
                      disabled
                      placeholder="Auto-filled based on accumulation type"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                      Accumulation
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-2 py-1 text-xs border rounded focus:outline-none transition-colors border-gray-200 focus:border-blue-500"
                      type="text"
                      value={formField.accumulation}
                      onChange={(e) => {
                        setFormField({
                          ...formField,
                          accumulation: e.target.value,
                        });
                      }}
                      placeholder="Enter accumulation value"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                      Calculate Unit
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-2 py-1 text-xs border rounded focus:outline-none transition-colors border-gray-200 focus:border-blue-500"
                      type="number"
                      value={formField.calculateUnit}
                      onChange={(e) => {
                        setFormField({
                          ...formField,
                          calculateUnit: parseInt(e.target.value) || 1,
                        });
                      }}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 mt-2">
                  <label className="text-xs font-medium text-gray-700">
                    Remarks
                  </label>
                  <textarea
                    className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    rows={2}
                    value={formField.remarks}
                    onChange={(e) => {
                      setFormField({
                        ...formField,
                        remarks: e.target.value,
                      });
                    }}
                    placeholder="Enter remarks"
                  />
                </div>
              </div>

              {/* Tabs Section */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <Tabs
                  value={currentTab}
                  onChange={handleTabChange}
                  className="border-b"
                  sx={{
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontWeight: 500,
                    },
                  }}
                >
                  <Tab label="Time Span Accumulation" />
                  <Tab label="Reference Accumulation" />
                  <Tab label="Expression Price" />
                </Tabs>

                <div className="flex-1 overflow-y-auto p-6">
                  {currentTab === 0 && (
                    <TimeSpanUpdateComponent
                      data={formField.timeSpanAccumulation || []}
                      priceVerId={currentPriceVerId}
                      onChange={(data) =>
                        setFormField((prev) => ({
                          ...prev,
                          timeSpanAccumulation: data,
                        }))
                      }
                    />
                  )}

                  {currentTab === 1 && (
                    <ReferenceUpdateAccumulationComponent
                      data={formField.referenceAccumulation || []}
                      priceVerId={currentPriceVerId}
                      onChange={(data) =>
                        setFormField((prev) => ({
                          ...prev,
                          referenceAccumulation: data,
                        }))
                      }
                      timeSpanAccumulation={
                        formField.timeSpanAccumulation || []
                      }
                    />
                  )}

                  {currentTab === 2 && (
                    <ExpressionPriceComponent
                      data={formField.expressionPrice}
                      onChange={(data) =>
                        setFormField((prev) => ({
                          ...prev,
                          expressionPrice: data,
                        }))
                      }
                      scriptToChange={scriptToChange}
                    />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={onClose}
                  className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  sx={{
                    color: "text.secondary",
                    borderColor: "grey.400",
                    "&:hover": {
                      borderColor: "error.main",
                      color: "error.main",
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
                  sx={{
                    backgroundColor: "primary.main",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                    "&:disabled": {
                      backgroundColor: "grey.400",
                    },
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress
                        size={20}
                        sx={{ mr: 1, color: "inherit" }}
                      />
                      Updating...
                    </>
                  ) : (
                    "Update Accumulation Price"
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateAccumulationPriceDialog;
