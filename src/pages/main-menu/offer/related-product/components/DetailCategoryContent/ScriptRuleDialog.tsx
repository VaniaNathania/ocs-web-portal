import React, { useState, useMemo, useCallback } from "react";
import { X, Search, Plus } from "lucide-react";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";
import { useOfferLayout } from "@/layouts/main-menu/offer";
// import { ListToolBarFeature } from './ListToolBarFeature'; // Commented out as it's not directly used in this component's logic
// import { ListToolBarFeature } from './ListToolBarFeature'; // Commented out as it's not directly used in this component's logic

export interface Feature {
  id: string;
  name: string;
  code: string;
  operation: string;
  selected: boolean;
}

interface AddVersionDialogProps {
  // Renamed to AddVersionDialogProps for consistency
  isOpen: boolean;
  onClose: () => void;
  // onAdd: (selectedFeatures: Feature[]) => void;
}

const ScriptRuleDialog: React.FC<AddVersionDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const {menuPrivAccess} = useOfferLayout()
  const [isPackage, setIsPackage] = useState("Yes"); // State for radio buttons, if still needed
  const [activeTab, setActiveTab] = useState("scriptRule"); // State to manage active tab

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  // Java Example Script Content (as a multiline string for readability)
  const javaExampleScript = `public class RebateCalculator {

    // Example Script (now in Java)
    /**
     * Calculates the rebate based on price and usage.
     * If usage exceeds 100, a 5% rebate on the price is applied.
     * Otherwise, no rebate is given.
     *
     * @param price The original price.
     * @param usage The usage value.
     * @return The calculated rebate amount.
     */
    public static double calculateRebate(double price, int usage) {
        if (usage > 100) {
            return price * 0.05; // 5% of the price
        } else {
            return 0.0; // No rebate
        }
    }
}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
          <DialogHeader>
            <DialogTitle className="text-gray-800 text-lg font-semibold">
              Sales Script Rule
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "scriptRule"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("scriptRule")}
          >
            Script Rule
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "example"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("example")}
          >
            Example
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === "scriptRule" && (
            <textarea
              className="w-full h-80 p-2 border rounded-md resize-y font-mono text-sm"
              placeholder="Write your script rule here..."
            />
          )}
          {activeTab === "example" && (
            <div>
              <p className="text-gray-700">
                This is where you can see examples of script rules.
              </p>
              <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm font-mono overflow-auto">
                <code>{javaExampleScript}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-4 py-3 border-t flex justify-end items-center gap-2">
          <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>   
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Compile
          </button>
          </AccessWrapper>
          <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            OK
          </button>
          </AccessWrapper>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ScriptRuleDialog;
