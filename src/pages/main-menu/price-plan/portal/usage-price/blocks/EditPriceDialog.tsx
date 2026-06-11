import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "@/components";
import axios from "axios";
import { apiConfig } from "@/config/api.config";
import { toast } from "sonner";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAuth, useAuthContext } from "@/auth";
import { useCallApi } from "@/hooks";
import { doSaveLogActivity } from "@/actions/GlobalActions";
import { RefreshCw } from "lucide-react";
import { useUsagePriceCreateContext } from "../hooks";
import TimeSpanComponent, {
  TimeSpanUp,
} from "./Rating.tsx/update/TimeSpanComponent";
import RankUpComponent, { RankUp } from "./Rating.tsx/update/RankUpComponent";
import AccumulationPriceComponent, {
  AccumulationPrice,
} from "./Rating.tsx/update/AccumulationPrice";
import AccumulationCalculationComponent, {
  AccumulationCalculation,
} from "./Rating.tsx/update/AccumulationCalculation";
import ExpressionPriceComponent, {
  ExpressionPrice,
} from "./Rating.tsx/update/ExpressionPrice";
import { CircularProgress, Tab, Tabs, Typography } from "@mui/material";
import { set } from "date-fns";

const API_URL = apiConfig.service_price_plan;

interface PriceVersionFormData {
  priceName: string;
  acctItemTypeId: number;
  price: string;
  payIndicator: boolean | null;
  rum: number;
  reAttr: string;
  comments: string;
  timeSpanUp: TimeSpanUp[] | null;
  rankUp: RankUp[] | null;
  accumulationPrice: AccumulationPrice[] | null;
  accumulationCalculation: AccumulationCalculation[] | null;
  expressionPrice: ExpressionPrice | null;
  offerVerId?: number | null;
  ratePlanId?: string | null;
}

interface EditPriceDialogProps {
  showEditDialog: boolean;
  priceId: string | null;
  priceVerId: number | null;
  handleEditDialog: (show: boolean, id: string | null) => void;
  onUpdateSuccess?: () => void;
}

interface AccumulationListVersion {
  resourceId: number;
  resourceName: string;
  reAttrId: number;
  reAttrName: string;
}

const EditPriceDialog: React.FC<EditPriceDialogProps> = ({
  showEditDialog,
  priceId,
  priceVerId,
  handleEditDialog,
  onUpdateSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const { PostData, GetData, PutData } = useCallApi();
  const { reAttr } = useUsagePriceCreateContext();

  const [accu, setAccu] = useState<AccumulationListVersion[]>([]);
  const [selectedAccumulationType, setSelectedAccumulationType] =
    useState<number>(0);

  const [effDate, setEffDate] = useState<any>(null);
  const [expDate, setExpDate] = useState<any>(null);
  const [formField, setFormField] = useState<PriceVersionFormData>({
    priceName: "",
    price: "",
    rum: 0,
    payIndicator: null,
    acctItemTypeId: 0,
    reAttr: "",
    comments: "",
    timeSpanUp: null,
    rankUp: null,
    accumulationPrice: null,
    accumulationCalculation: null,
    expressionPrice: null,
  });

  // Fetch accumulation list
  useEffect(() => {
    const getAccumulationList = async () => {
      try {
        const response = await GetData(
          `${API_URL}/price/accumulation-type/list`,
          {},
        );
        setAccu(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch accumulation list:", error);
      }
    };

    getAccumulationList();
  }, [GetData]);

  // Fetch accumulation detail for update
  useEffect(() => {
    const fetchAccumulationDetail = async () => {
      if (!priceId) return;

      setIsLoadingData(true);
      try {
        const response = await GetData(
          `${API_URL}/price/detail/${priceId}`,
          {},
        );
        const data = response?.data;
        setEffDate(data.effDate);
        setExpDate(data.expDate);

        if (data) {
          // Set form field dengan data dari API
          setFormField((prev) => ({
            ...prev,
            priceName: data.priceName || "",
            price: data.price || "",
            rum: data.rum || 0,
            payIndicator: data.payIndicator,
            reAttr: data.reAttr || "",
            acctItemTypeId: data.acctItemTypeId || 0, // Pastikan ini ter-set
            comments: data.comments || "",
            timeSpanUp: data.timeSpanUp || null,
            rankUp: data.rankUp || null,
            accumulationPrice: data.accumulationPrice || null,
            accumulationCalculation: data.accumulationCalculation || null,
            expressionPrice: data.expressionPrice || null,
          }));

          // Set selected accumulation type untuk dropdown
          setSelectedAccumulationType(data.acctItemTypeId || 0);
        }

        //  console.log("Fetched accumulation detail:", data);
      } catch (error) {
        console.error("Failed to fetch accumulation detail:", error);
        toast.error("Failed to load accumulation data");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (showEditDialog && priceId) {
      fetchAccumulationDetail();
    }
  }, [showEditDialog, priceId, GetData]);

  const doUpdateAccumulationPrice = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Clean up empty arrays before sending
      const submitData = {
        ...formField,
        timeSpanAccumulation: formField.timeSpanUp?.length
          ? formField.timeSpanUp
          : null,
        rankUp: formField.rankUp?.length ? formField.rankUp : null,
        accumulationPrice: formField.accumulationPrice?.length
          ? formField.accumulationPrice
          : null,
        accumulationCalculation: formField.accumulationCalculation?.length
          ? formField.accumulationCalculation
          : null,
        expressionPrice: formField.expressionPrice
          ? formField.expressionPrice
          : null,
      };

      const response = await PutData(`${API_URL}/price/update`, submitData);

      if (response?.message) {
        toast.success("Price successfully updated!");
        onUpdateSuccess?.();
      } else {
        toast.error("Failed to update accumulation price");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while updating accumulation price",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [formField, PutData, onUpdateSuccess]);

  // Fixed: Update both state and form field
  const handleAccumulationTypeChange = (resourceId: number) => {
    setSelectedAccumulationType(resourceId);

    const selectedAccu = accu.find((item) => item.resourceId === resourceId);

    if (selectedAccu) {
      setFormField((prev) => ({
        ...prev,
        acctItemTypeId: selectedAccu.resourceId, // Update acctItemTypeId
        // Tambahan jika diperlukan untuk tracking reAttrId
        // reAttrId: selectedAccu.reAttrId,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doUpdateAccumulationPrice();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Dialog
      open={showEditDialog}
      onOpenChange={(open) => handleEditDialog(open, null)}
    >
      <DialogTitle className="text-lg font-semibold text-gray-900 border-b border-gray-200">
        Update Accumulation Price
      </DialogTitle>

      <DialogContent className="p-0 overflow-hidden max-w-4xl">
        {isLoadingData ? (
          <div className="flex justify-center items-center p-8">
            <CircularProgress />
            <Typography className="ml-2">
              Loading accumulation data...
            </Typography>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <div className="overflow-y-auto p-6">
              {/* Basic Information Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Basic Information
                </h3>

                {/* Row 1 - Left and Right columns */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Effective Date
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 cursor-not-allowed"
                        type="text"
                        value={effDate}
                        disabled
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Price Name
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        autoComplete="off"
                        value={formField.priceName}
                        onChange={(e) => {
                          setFormField((prev) => ({
                            ...prev,
                            priceName: e.target.value,
                          }));
                        }}
                        placeholder="Enter price name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        RUM
                      </label>
                      <Input
                        type="number"
                        value={formField.rum}
                        onChange={(e) => {
                          setFormField((prev) => ({
                            ...prev,
                            rum: parseInt(e.target.value) || 0,
                          }));
                        }}
                        placeholder="Enter RUM"
                      />
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Expiry Date
                      </label>
                      <input
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 cursor-not-allowed"
                        type="text"
                        value={expDate}
                        disabled
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Price
                        <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formField.price}
                        onChange={(e) => {
                          setFormField((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }));
                        }}
                        placeholder="Enter price"
                        required
                      />
                    </div>

                    {/* Accumulation Type Dropdown */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Accumulation Type
                        <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none transition-colors focus:border-blue-500"
                        value={selectedAccumulationType || ""}
                        onChange={(e) =>
                          handleAccumulationTypeChange(
                            parseInt(e.target.value) || 0,
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

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        Re-Attribute
                        <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={formField.reAttr}
                        onValueChange={(value) => {
                          setFormField((prev) => ({
                            ...prev,
                            reAttr: value,
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select re-attribute" />
                        </SelectTrigger>
                        <SelectContent>
                          {reAttr.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.reAttrName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Row 2 - Full width for comments */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Comments
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none transition-colors focus:border-blue-500 resize-none"
                    rows={3}
                    autoComplete="off"
                    value={formField.comments}
                    onChange={({ target }) => {
                      setFormField((prev) => ({
                        ...prev,
                        comments: target.value,
                      }));
                    }}
                    placeholder="Enter comments"
                  />
                </div>
              </div>
            </div>

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
                    data={formField.timeSpanUp || []}
                    onChange={(data) =>
                      setFormField({ ...formField, timeSpanUp: data })
                    }
                    priceId={priceId}
                  />
                )}

                {/* Uncomment these when ready to use */}
                {/* 
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
                    timeSpanAccumulation={formField.timeSpanAccumulation || []}
                  />
                )}

                {currentTab === 2 && (
                  <ExpressionUpdatePriceUpdateComponent
                    data={formField.expressionPrice}
                    onChange={(data) =>
                      setFormField((prev) => ({
                        ...prev,
                        expressionPrice: data,
                      }))
                    }
                  />
                )}
                */}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleEditDialog(false, null)}
                className="px-6 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
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
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditPriceDialog;
