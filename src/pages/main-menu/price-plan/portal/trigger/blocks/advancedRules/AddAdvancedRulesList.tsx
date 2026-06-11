import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { apiConfig } from "@/config/api.config";
import { useCallApi } from "@/hooks";
import { XMLParser } from "fast-xml-parser";
import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTriggerCreateContext } from "../../hooks";
import ExpressionPriceComponent from "./ExpressionPrice";

interface TriggerRule {
  scriptTempletId: number | null;
  scriptPage: string | null;
  ruleScript: string | null;
}

interface AdvancedRules {
  effDate: string;
  expDate: string | null;
  offerVerId: number;
  spId: number;
  triggerRule: TriggerRule | null;
}

interface ScriptTemplate {
  scriptTempletId: number;
  scriptTempletName: string;
}

interface ScriptTemplateDetail {
  scriptTempletName: string;
  templetContent: string;
  templetTypeScript: string;
  templateId: number;
}

interface TemplateProperty {
  id: string;
  name: string;
  displayName: string;
  dataType: string;
  defaultValue: string;
  type: string;
  nullable: string;
  comments: string;
  minValue: string;
  maxValue: string;
  minLength: string;
  maxLength: string;
  value: string;
}

interface AdvancedRulesProps {
  refreshData: () => void;
}

const API_URL = apiConfig.service_price_plan;

const AdvancedRulesComponent: React.FC<AdvancedRulesProps> = ({ refreshData }) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const { selectedOfferVerId } = usePortalData();
  const [scriptList, setScriptList] = useState<ScriptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ScriptTemplateDetail | null>(null);
  const [templateFields, setTemplateFields] = useState<TemplateProperty[]>([]);
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const { GetData, PostData } = useCallApi();
  const [formField, setFormField] = useState<AdvancedRules>({
    effDate: "",
    expDate: null,
    offerVerId: selectedOfferVerId || 0,
    spId: 0,
    triggerRule: {
      scriptTempletId: null,
      scriptPage: null,
      ruleScript: null,
    },
  });
  const { handleAddAdvanceRuleDialog, showAddAdvanceRuleDialog } = useTriggerCreateContext();

  const handleSubmit = async () => {
    if (!formField.effDate) {
      return toast.error("Effective date is required.");
    }
    // e.preventDefault();
    try {
      const res = await PostData(`${API_URL}/trigger/advance-rule/create`, formField);
      if (res?.status) {
        toast.success(res.message);
        handleAddAdvanceRuleDialog(false);
        refreshData();
      } else {
        toast.error(res?.message || "Failed to add rule");
      }
    } catch (err) {
      toast.error("Error submitting form");
    }
  };

  const handleFormFieldChange = (field: keyof AdvancedRules, value: any) => {
    setFormField((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={showAddAdvanceRuleDialog} onOpenChange={handleAddAdvanceRuleDialog}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto p-8">
        <DialogHeader className="pb-6 border-b mb-6">
          <DialogTitle className="text-lg font-medium mb-3">Add Advanced Rules</DialogTitle>
        </DialogHeader>

        {/* <form onSubmit={handleSubmit} className="space-y-8"> */}
          {/* Basic Information */}

          <div className="bg-gray-50 p-6 rounded-lg border">
            <h2></h2>
            <h3 className="text-sm font-medium mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm">
                  Effective Date <span className="text-red-500">*</span>
                </Label>
                <Input type="date" value={formField.effDate} onChange={(e) => handleFormFieldChange("effDate", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Expiry Date</Label>
                <Input type="date" value={formField.expDate ?? ""} onChange={(e) => handleFormFieldChange("expDate", e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>

          {/* Expression Price */}
          <div>
            <h2 className="text-lg font-medium mb-3">Expression Price</h2>
            <ExpressionPriceComponent
              data={formField.triggerRule}
              onChange={(data) =>
                setFormField((prev) => ({
                  ...prev,
                  triggerRule: data,
                }))
              }
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => handleAddAdvanceRuleDialog(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit}>
              Submit
            </Button>
          </div>
        {/* </form> */}
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedRulesComponent;
