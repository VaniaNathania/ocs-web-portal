import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { useTriggerCreateContext } from "../../hooks";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import TriggerRuleUpdate from "./UpdateExpressionPrice";
import { TriggerRule } from "./ExpressionPrice";

interface AdvancedRules {
  triggerId: number;
  effDate: string;
  expDate: string | null;
  offerVerId: number;
  spId: number;
  triggerRule: TriggerRule | null;
}

interface EditProps {
  onRefresh: () => void;
}

const API_URL = apiConfig.service_price_plan;

const EditAdvancedRules: React.FC<EditProps> = ({ onRefresh }) => {
  const { showEditAdvancedRulesDialog, handleEditAdvancedRulesDialog, selectedAdvancedRules, setSelectedAdvancedRules } = useTriggerCreateContext();
  const { selectedOfferVerId } = usePortalData();
  const [loading, setLoading] = useState<boolean>(false);
  const [scriptToChange, setScriptToChange] = useState<string>("");
  const { GetData, PostData, PutData } = useCallApi();

  const [formField, setFormField] = useState<AdvancedRules>({
    triggerId: 0,
    effDate: "",
    expDate: null,
    offerVerId: 0,
    spId: 0,
    triggerRule: null,
  });

  // Reset all form state to initial values
  const resetFormState = () => {
    setFormField({
      triggerId: 0,
      effDate: "",
      expDate: "",
      offerVerId: 0,
      spId: 0,
      triggerRule: null,
    });
    setScriptToChange("");
    setLoading(false);
  };

  // Enhanced close dialog handler with reset
  const handleCloseDialog = () => {
    handleEditAdvancedRulesDialog(false, null);
    setSelectedAdvancedRules(null);
    resetFormState();
  };

  // Simplified processTriggerRuleData - hanya konversi data BE ke format component
  const processTriggerRuleData = useCallback(() => {
    if (!selectedAdvancedRules) return;

    const { scriptTempletId, ruleComments, scriptPage, ruleScript: existingRuleScript } = selectedAdvancedRules;

    // Simpan scriptPage mentah untuk diteruskan ke TriggerRuleUpdate
    setScriptToChange(scriptPage || "");

    // Langsung gunakan data dari BE tanpa parsing kompleks
    const triggerRuleData: TriggerRule = {
      scriptTempletId: scriptTempletId || null, // ✅ Pastikan scriptTempletId tidak hilang
      ruleScript: existingRuleScript || "",
      scriptPage: scriptPage || null,
    };

    // Set ke form
    setFormField((prev) => ({
      ...prev,
      triggerRule: triggerRuleData,
    }));
  }, [selectedAdvancedRules]);

  // Handle submit
  const handleSubmit = async () => {
    if (!formField.effDate) {
      return toast.error("Effective date is required.");
    }
    setLoading(true);

    try {
      const updateData = {
        effDate: formField.effDate,
        expDate: formField.expDate,
        spId: formField.spId,
        offerVerId: selectedOfferVerId || 0,
        triggerRule: formField.triggerRule,
      };

      const res = await PutData(`${API_URL}/trigger/advance-rule/edit/${formField.triggerId}/${selectedAdvancedRules.seq}`, updateData);

      if (res?.status || res?.message?.includes("success")) {
        toast.success("Advanced Rule updated successfully!");
        handleCloseDialog();
        onRefresh();
      } else {
        toast.error(res?.message || "Failed to update rule");
      }
    } catch (err) {
      console.error("Error updating advanced rule:", err);
      toast.error("Error updating form");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showEditAdvancedRulesDialog && selectedAdvancedRules) {
      setFormField((prev) => ({
        ...prev,
        triggerId: selectedAdvancedRules.triggerId,
        effDate: selectedAdvancedRules.effDate || "",
        expDate: selectedAdvancedRules.expDate || "",
        offerVerId: selectedOfferVerId || 0,
        spId: selectedAdvancedRules.spId || 0,
      }));

      // Process trigger rule data
      processTriggerRuleData();
    }
  }, [showEditAdvancedRulesDialog, selectedAdvancedRules, selectedOfferVerId, processTriggerRuleData]);

  return (
    <Dialog
      open={showEditAdvancedRulesDialog}
      onOpenChange={(open) => {
        if (!open) {
          handleCloseDialog();
        }
      }}
    >
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-xl font-semibold text-gray-800">Edit Advanced Rules Configuration</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">Configure and update advanced rule parameters</DialogDescription>
        </DialogHeader>

        {/* <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        > */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="space-y-8">
            {/* Basic Form Fields */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Effective Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formField.effDate}
                    onChange={(e) =>
                      setFormField((prev) => ({
                        ...prev,
                        effDate: e.target.value,
                      }))
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
                  <Input
                    type="date"
                    value={formField.expDate ?? ""}
                    onChange={(e) =>
                      setFormField((prev) => ({
                        ...prev,
                        expDate: e.target.value,
                      }))
                    }
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium mb-3">Expression Price</h2>
              <TriggerRuleUpdate
                data={formField.triggerRule}
                scriptToChange={scriptToChange}
                onChange={useCallback(
                  (data) =>
                    setFormField((prev) => ({
                      ...prev,
                      triggerRule: data,
                    })),
                  [],
                )}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={loading} className="hover:bg-gray-50 transition-colors">
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-sm hover:shadow-md transition-all">
            {loading ? "Updating..." : "Update Advanced Rules"}
          </Button>
        </DialogFooter>
        {/* </form> */}
      </DialogContent>
    </Dialog>
  );
};

export default EditAdvancedRules;
