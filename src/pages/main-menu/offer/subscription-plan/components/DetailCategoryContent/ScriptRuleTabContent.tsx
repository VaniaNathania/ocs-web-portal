import React, { useState, useMemo, useCallback } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import {
  DataGridColumnHeader,
  DataGridProvider,
  DefaultTooltip,
  KeenIcon,
} from "@/components";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import ScriptRuleDialog from "../../blocks/ScriptRuleDialog";
const ScriptRuleTabContent = ({}) => {
  const [activeTab, setActiveTab] = useState("detail");
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogSettingOpen, setisDialogSettingOpen] = useState(false);

  const [isPackage, setIsPackage] = useState("Yes");
  const [autoRenewal, setAutoRenewal] = useState("Yes");

  const handleSettingDialog = () => {
    setisDialogSettingOpen(true);
  };

  const handleCloseSettingDialog = () => {
    setisDialogSettingOpen(false);
  };

  const handleSetingDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="flex flex-col">
      {/* Detail Tab Only */}
      {activeTab === "detail" && (
        <>
          <div className="">
            <ScriptRuleDialog isOpen={isDialogSettingOpen} onClose={handleCloseSettingDialog} />

            <div className="min-h-[400px] bg-white">
              <div className="border rounded shadow-sm">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <h1 className="mt-5 ml-2 text-2xl font-semibold">
                      Script Rule
                    </h1>
                  </div>
                </div>

                {/* Form Section */}
                <div className="w-full p-6  ">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Row for Rebate and Setting */}
                    <div className="col-span-2 flex items-center gap-2">
                      {" "}
                      {/* Use col-span-2 to ensure it takes full width, flex and gap for alignment */}
                      <button
                        type="button"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 cursor-pointer p-0 border-none bg-transparent text-sm" // Blue color, hover effect, flex for icon+text, gap for spacing
                        onClick={handleSettingDialog} // Uncomment and implement your dialog handler
                      >
                        Script Rule
                      </button>
                    </div>

                    <div className="col-span-2">
                      <p className="text-gray-500 text-sm">No Record Found</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default ScriptRuleTabContent;
