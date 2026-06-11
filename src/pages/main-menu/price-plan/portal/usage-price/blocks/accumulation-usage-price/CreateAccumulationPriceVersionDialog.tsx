import React, { useCallback, useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, Box, Typography, Grid, FormControlLabel, Switch, Tabs, Tab, TextField, Select, MenuItem, FormControl, InputLabel, IconButton } from "@mui/material";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { toast } from "sonner";
import { useAuthContext } from "@/auth";
import { DialogBody } from "@/components/ui/dialog";
import { RefreshCw } from "lucide-react";
import { useUsagePriceCreateContext } from "../../hooks";
import ReferenceAccumulationComponent, { ReferenceAccumulation } from "./create-sub/RefrenceAccumulationComponent";
import TimeSpanComponent, { TimeSpanAccumulation } from "./create-sub/TimeSpanComponent";
// import ExpressionPriceComponent, { ExpressionPrice } from "./create-sub/ExpressionPriceComponent";
import { nullable } from "zod";
import ExpressionPriceComponent, { ExpressionPrice } from "./create-sub/ExpressionPriceComponent";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { NumericFormat } from "react-number-format";

interface CreateAccumulationPriceVersionDialogProps {
  onClose: () => void;
  mappingId: number | null;
  expDate: any;
}

interface AccumulationFormData {
  mappingId: number | null;
  offerVerId: number;
  ratePlanId: number;
  priceVerId: number;
  effDate: string;
  expDate: string;
  resourceId: number;
  reAttrId: number;
  calculateUnit: number;
  accumulation: string;
  remarks: string;
  timeSpanAccumulation: TimeSpanAccumulation[] | null;
  referenceAccumulation: ReferenceAccumulation[] | null;
  expressionPrice: ExpressionPrice | null;
}

interface AccumulationListVersion {
  resourceId: number;
  resourceName: string;
  reAttrId: number;
  reAttrName: string;
}

// Main Dialog Component
const API_URL_PRICE_PLAN = apiConfig.service_price_plan;

const CreateAccumulationPriceVersionDialog: React.FC<CreateAccumulationPriceVersionDialogProps> = ({ onClose, mappingId, expDate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const { pricePlanDetail } = useAuthContext();
  const { PostData, GetData } = useCallApi();
  const { selectedOfferVerId } = usePortalData();
  const { selectedRatePlan, formatedValue } = useUsagePriceCreateContext();

  const [accu, setAccu] = useState<AccumulationListVersion[]>([]);
  const [selectedAccumulationType, setSelectedAccumulationType] = useState<number>(0);

  const [formField, setFormField] = useState<AccumulationFormData>({
    offerVerId: selectedOfferVerId || 0,
    ratePlanId: selectedRatePlan || 0,
    priceVerId: 0,
    effDate: expDate,
    expDate: "",
    resourceId: 0,
    reAttrId: 0,
    calculateUnit: 0,
    accumulation: "",
    remarks: "",
    timeSpanAccumulation: [],
    referenceAccumulation: [],
    expressionPrice: null,
    mappingId: mappingId,
  });

  useEffect(() => {
    const getAccumulationList = async () => {
      try {
        const response = await GetData(`${API_URL_PRICE_PLAN}/price/accumulation-type/list`, {});
        setAccu(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch accumulation list:", error);
      }
    };

    getAccumulationList();
  }, []);

  const validateForm = () => {
    // Effective Date
    if (!formField.effDate) {
      toast.error("Effective date is required");
      return false;
    }

    if (!formField.accumulation) {
      toast.error("Accumulation is required");
      return false;
    }

    return true;
  };

  const validateDates = () => {
    if (!formField.effDate) {
      toast.error("Effective date is required");
      return false;
    }

    if (!formField.expDate) return true; // expDate opsional

    const eff = new Date(formField.effDate);
    const exp = new Date(formField.expDate);

    if (exp < eff) {
      toast.error("Expiry date cannot be earlier than effective date");
      return false;
    }

    return true;
  };

  const handleAccumulationTypeChange = (resourceId: number) => {
    setSelectedAccumulationType(resourceId);

    const selectedAccu = accu.find((item) => item.resourceId === resourceId);

    if (selectedAccu) {
      setFormField((prev) => ({
        ...prev,
        resourceId: selectedAccu.resourceId,
        reAttrId: selectedAccu.reAttrId,
      }));
    }
  };

  const doCreateAccumulationPrice = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Clean up empty arrays before sending
      const submitData = {
        ...formField,
        timeSpanAccumulation: formField.timeSpanAccumulation?.length ? formField.timeSpanAccumulation : null,
        referenceAccumulation: formField.referenceAccumulation?.length ? formField.referenceAccumulation : null,
      };

      const response = await PostData(`${API_URL_PRICE_PLAN}/price/accumulation/create`, submitData);

      if (response?.status) {
        toast.success(response?.message || "Accumulation price successfully created!");
        onClose();
      } else {
        toast.error(response?.message || "Failed to create accumulation price");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred while creating accumulation price");
    } finally {
      setIsSubmitting(false);
    }
  }, [formField, PostData, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi semua field wajib
    if (!validateForm()) return;

    // Validasi effective + expiry date
    if (!validateDates()) return;

    doCreateAccumulationPrice();
  };

  const selectedAccuItem = accu.find((item) => item.resourceId === selectedAccumulationType);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Dialog
      open
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
      <DialogTitle className="text-lg font-semibold text-gray-900 border-b border-gray-200">Create New Accumulation Price</DialogTitle>

      <DialogContent className="p-0 overflow-visible">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="overflow-y-auto">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700 flex items-center gap-1">
                    Effective Date
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none transition-colors border-gray-200 focus:border-blue-500"
                    type="date"
                    disabled={!!expDate}
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
                  <label className="text-xs font-medium text-gray-700">Expiry Date</label>
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
                    onChange={(e) => handleAccumulationTypeChange(parseInt(e.target.value) || 0)}
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
                  <label className="text-xs font-medium text-gray-700">Event Change</label>
                  <input
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none transition-colors border-gray-200 bg-gray-50"
                    type="text"
                    value={selectedAccuItem ? `${selectedAccuItem.reAttrId}` : ""}
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
                  <NumericFormat
                    className="w-full px-2 py-1 text-xs border rounded focus:outline-none transition-colors border-gray-200 focus:border-blue-500"
                    thousandSeparator=","
                    decimalSeparator="."
                    decimalScale={5}
                    fixedDecimalScale={true}
                    allowNegative={false}
                    value={formField.accumulation !== undefined && formField.accumulation !== "" ? Number(formatedValue(Number(formField.accumulation))?.replace(/,/g, "")) : ""}
                    onValueChange={(values) => {
                      const raw = Number(values.value) * 100000;
                      setFormField({
                        ...formField,
                        accumulation: isNaN(raw) ? "" : raw.toString(),
                      });
                    }}
                    placeholder="0.00000"
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
                <label className="text-xs font-medium text-gray-700">Remarks</label>
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
                  <TimeSpanComponent
                    data={formField.timeSpanAccumulation || []}
                    onChange={(data) =>
                      setFormField((prev) => ({
                        ...prev,
                        timeSpanAccumulation: data,
                      }))
                    }
                  />
                )}

                {currentTab === 1 && (
                  <ReferenceAccumulationComponent
                    data={formField.referenceAccumulation || []}
                    onChange={(data) =>
                      setFormField((prev) => ({
                        ...prev,
                        referenceAccumulation: data,
                      }))
                    }
                    timeSpanAccumulation={formField.timeSpanAccumulation || []} // Add this prop
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
                    <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} />
                    Creating...
                  </>
                ) : (
                  "Create Accumulation Price"
                )}
              </Button>
            </div>
          </div>
          {/* Basic Information Section */}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAccumulationPriceVersionDialog;
