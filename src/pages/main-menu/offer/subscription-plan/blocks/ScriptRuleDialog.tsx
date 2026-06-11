import React, { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useOfferLayout } from "@/layouts/main-menu/offer";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

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

const ScriptRuleDialog: React.FC<AddVersionDialogProps> = ({ isOpen, onClose }) => {
  const [isPackage, setIsPackage] = useState("Yes"); // State for radio buttons, if still needed
  const [activeTab, setActiveTab] = useState("scriptRule"); // State to manage active tab
  const {menuPrivAccess} = useOfferLayout()

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  // Java Example Script Content (as a multiline string for readability)
  const javaExampleScript = `from java.lang import Long
from com.ztesoft.zsmart.core.exception import BaseAppException
from com.ztesoft.zsmart.core.service import IAction
class JythonApplication(IAction):
     def perform(self, bo):
         #以下为获取入参方法，获取BO中的参数
         #公共参数:
         #staffInfo = bo.get("STAFF_INFO")
         #cust = bo.get("CUST")
         #过滤订户套餐私有参数:
         #校验VAS是否可以订购私有参数:
         dpOfferOrder = bo.get("DP_OFFER_ORDER")
         #channelType = bo.get("CHANNEL_TYPE")
         #spId = bo.get("SP_ID")
         #orderItem = bo.get("ORDER_ITEM")
         offerType = dpOfferOrder.getLong("OFFER_TYPE")
         if offerType == 4:
             #OFFER_SALES_RESULT为出参
             bo.set("OFFER_SALES_RESULT","N")
         else: 
             bo.set("OFFER_SALES_RESULT","Y")
         return 0 
global JYTHON_OBJECT 
JYTHON_OBJECT = JythonApplication()}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
          <DialogHeader>
            <DialogTitle className="text-gray-800 text-lg font-semibold">Sales Script Rule</DialogTitle>
          </DialogHeader>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-4">
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === "scriptRule" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-800"}`} onClick={() => setActiveTab("scriptRule")}>
            Script Rule
          </button>
          <button className={`px-4 py-2 text-sm font-medium ${activeTab === "example" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600 hover:text-gray-800"}`} onClick={() => setActiveTab("example")}>
            Example
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto p-4">
          {activeTab === "scriptRule" && <textarea className="w-full h-80 p-2 border rounded-md resize-y font-mono text-sm" placeholder="Write your script rule here..." />}
          {activeTab === "example" && (
            <div>
              <p className="text-gray-700">This is where you can see examples of script rules.</p>
              <pre className="bg-gray-100 p-3 rounded-md mt-2 text-sm font-mono overflow-auto">
                <code>{javaExampleScript}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="px-4 py-3 border-t flex justify-end items-center gap-2">
          <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Compile</button>
          </AccessWrapper>
          <AccessWrapper hasAccess={menuPrivAccess?.addStatus}>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">OK</button>
          </AccessWrapper>
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200">
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScriptRuleDialog;
