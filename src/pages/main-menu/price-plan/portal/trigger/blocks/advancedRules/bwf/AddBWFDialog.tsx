// import React, { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent } from "@/components/ui/card";
// import { toast } from "sonner";
// import { apiConfig } from "@/config/api.config";
// import { useCallApi } from "@/hooks";
// import { XMLParser } from "fast-xml-parser";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { usePortalData } from "@/layouts/portal/price-plan/hooks/PortalDataContext";
// import { useTriggerCreateContext } from "../../../hooks";
// import ExpressionTab from "./ExpressionTab";
// import ResultTab from "./ResultTab";

// interface EditProps {
//   onRefresh: () => void;
//   advancedInfo: AdvancedInfo;
// }

// const API_URL = apiConfig.service_price_plan;

// const BwfDialog: React.FC<EditProps> = ({ onRefresh, advancedInfo }) => {
//   const { showBWFDialog, setShowBWFDialog, handleShowBWFDialog, selectedAdvancedRules, setSelectedAdvancedRules } = useTriggerCreateContext();

//   const { selectedOfferVerId } = usePortalData();
//   const [scriptList, setScriptList] = useState<ScriptTemplate[]>([]);
//   const [selectedTemplate, setSelectedTemplate] = useState<ScriptTemplateDetail | null>(null);
//   const [templateFields, setTemplateFields] = useState<TemplateProperty[]>([]);
//   const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
//   const [comboBoxItems, setComboBoxItems] = useState<Record<string, ComboBoxItem[]>>({});
//   const [loading, setLoading] = useState<boolean>(false);
//   const [templateFieldsLoading, setTemplateFieldsLoading] = useState<boolean>(false);
//   const [scriptListLoading, setScriptListLoading] = useState<boolean>(false);
//   const [workflowLoading, setWorkflowLoading] = useState<boolean>(false);
//   const [detailBWFLoading, setDetailBWFLoading] = useState<boolean>(false);
//   const [isEditingSysAction, setIsEditingSysAction] = useState(false);

//   // New state for expression editing
//   const [isEditingExpression, setIsEditingExpression] = useState(false);

//   const { GetData, PostData, PutData } = useCallApi();
//   const [activeTab, setActiveTab] = useState<"expression" | "result">("expression");
//   const [workflowList, setWorkflowList] = useState<WorkFlowInfo | null>(null);

//   // Script to change state - similar to UpdateAccumulationPriceDialog
//   const [scriptToChange, setScriptToChange] = useState<string>("");

//   const [formField, setFormField] = useState<BWFProps>({
//     sortRuleName: "",
//     effDate: "",
//     expDate: null,
//     comments: null,
//     bwfCondGroupList: null,
//     bwfActionList: null,
//     bwfSysActionDto: null,
//     spId: 0,
//     nodeId: null,
//     triggerId: advancedInfo.triggerId,
//     seq: advancedInfo.seq,
//   });

//   // Fetch workflow data
//   const fetchWorkFlow = async () => {
//     if (!selectedAdvancedRules?.workflowId) {
//       return null;
//     }

//     setWorkflowLoading(true);
//     try {
//       const res = await GetData(`${API_URL}/trigger/advance-rule/bwf/step/workflow?workFlowId=${selectedAdvancedRules.workflowId}`, {});

//       if (res?.data && res.data.length > 0) {
//         const firstWorkflow = res.data[0];
//         setWorkflowList(firstWorkflow);
//         return firstWorkflow;
//       }
//     } catch (error) {
//       console.error("Error fetching workflow:", error);
//       toast.error("Failed to load workflow data");
//     } finally {
//       setWorkflowLoading(false);
//     }
//     return null;
//   };

//   // Fetch BWF detail data with scriptToChange logic
//   const fetchDetailBwf = async (stepId: number) => {
//     setDetailBWFLoading(true);
//     try {
//       const res = await GetData(`${API_URL}/trigger/advance-rule/bwf/detail/${stepId}`, {});

//       if (res?.status && res?.message?.includes("No value present")) {
//         setFormField((prev) => ({
//           ...prev,
//           sortRuleName: selectedAdvancedRules?.ruleName || prev.sortRuleName || "",
//           effDate: selectedAdvancedRules?.effDate || new Date().toISOString().split("T")[0],
//           expDate: selectedAdvancedRules?.expDate || null,
//           comments: selectedAdvancedRules?.comments || null,
//           bwfCondGroupList: null,
//           bwfActionList: null,
//           bwfSysActionDto: null,
//           spId: selectedAdvancedRules?.spId || prev.spId || 0,
//           nodeId: selectedAdvancedRules?.nodeId || null,
//           triggerId: advancedInfo.triggerId,
//           seq: advancedInfo.seq,
//         }));
//         setScriptToChange("");
//         return;
//       }

//       if (res?.data) {
//         const bwfData = res.data;

//         // Parse bwfSysActionDto similar to expression parsing in UpdateAccumulationPriceDialog
//         let parsedBwfSysActionDto: bwfSysActionDto | null = null;
//         setScriptToChange(bwfData.bwfSysActionDto?.scriptPage || "");
//         if (bwfData.bwfSysActionDto) {
//           const { sysActionName, comments, spId, scriptTempletId, scriptPage, extScript: existingExtScript } = bwfData.bwfSysActionDto;

//           // ✅ Parsing scriptPage, support JSON & XML
//           let parsedValues: Record<string, string> = {};

//           try {
//             // --- Coba parse JSON (kayak ExpressionPrice)
//             parsedValues = JSON.parse(scriptPage || "[]")?.[0]?.[""] || {};
//           } catch (jsonErr) {
//             console.warn("scriptPage is not valid JSON, fallback to XML parse", jsonErr);
//             try {
//               // --- Kalau gagal, fallback ke XML
//               const parser = new XMLParser({
//                 ignoreAttributes: false,
//                 attributeNamePrefix: "",
//               });
//               const parsed = parser.parse(scriptPage || "<Properties/>");

//               const props = parsed?.Properties?.Property || [];
//               const items = parsed?.Properties?.value?.group?.item || [];
//               const arrProps = Array.isArray(props) ? props : [props];
//               const arrItems = Array.isArray(items) ? items : [items];

//               arrProps.forEach((p: any) => {
//                 const item = arrItems.find((i: any) => i.id === p.id);
//                 parsedValues[p.id] = (item?.value ?? p.defaultValue ?? "").toString();
//               });
//             } catch (xmlErr) {
//               console.error("Both JSON and XML parsing failed:", xmlErr);
//             }
//           }

//           // ✅ Inject ke extScript
//           let extScript = existingExtScript || "";
//           if (scriptTempletId) {
            
//           }

//           parsedBwfSysActionDto = {
//             sysActionName,
//             comments,
//             spId,
//             scriptTempletId,
//             scriptPage,
//             extScript,
//           };
//         }

//         setFormField((prev) => ({
//           ...prev,
//           sortRuleName: bwfData.sortRuleName || prev.sortRuleName,
//           effDate: bwfData.effDate || prev.effDate,
//           expDate: bwfData.expDate || prev.expDate,
//           comments: bwfData.comments || prev.comments,
//           bwfCondGroupList: bwfData.bwfCondGroupList || null,
//           bwfActionList: bwfData.bwfActionList || null,
//           bwfSysActionDto: parsedBwfSysActionDto,
//           spId: bwfData.spId || prev.spId,
//           nodeId: bwfData.nodeId || prev.nodeId,
//           triggerId: advancedInfo.triggerId,
//           seq: advancedInfo.seq,
//         }));
//       }
//     } catch (error) {
//       console.error("Error fetching BWF detail:", error);
//       toast.error("Failed to load BWF detail data");
//       setScriptToChange("");
//     } finally {
//       setDetailBWFLoading(false);
//     }
//   };

//   // Main effect
//   useEffect(() => {
//     const initializeData = async () => {
//       const workflow = await fetchWorkFlow();
//       setWorkflowList(workflow);
//       if (workflow?.stepId) {
//         await fetchDetailBwf(workflow.stepId);
//       }
//     };

//     if (showBWFDialog && selectedAdvancedRules) {
//       initializeData();
//     }
//   }, [showBWFDialog, selectedAdvancedRules]);

//   // Reset form state
//   const resetFormState = () => {
//     setFormField({
//       sortRuleName: "",
//       effDate: "",
//       expDate: "",
//       comments: "",
//       bwfCondGroupList: null,
//       bwfActionList: null,
//       bwfSysActionDto: null,
//       spId: 0,
//       nodeId: null,
//       triggerId: advancedInfo.triggerId,
//       seq: advancedInfo.seq,
//     });
//     setSelectedTemplate(null);
//     setTemplateFields([]);
//     setDynamicValues({});
//     setComboBoxItems({});
//     setScriptList([]);
//     setWorkflowList(null);
//     setScriptToChange("");
//     setLoading(false);
//     setTemplateFieldsLoading(false);
//     setScriptListLoading(false);
//     setWorkflowLoading(false);
//     setDetailBWFLoading(false);
//     setIsEditingSysAction(false);
//     setIsEditingExpression(false);
//   };

//   const handleConditionChange = (bwfCondGroupList: bwfCondGroup[]) => {
//     setFormField((prev) => ({
//       ...prev,
//       bwfCondGroupList,
//     }));
//   };

//   useEffect(() => {
//     if (advancedInfo) {
//       setFormField((prev) => ({
//         ...prev,
//         triggerId: advancedInfo.triggerId,
//         seq: advancedInfo.seq,
//       }));
//     }
//   }, [advancedInfo]);

//   const handleCloseDialog = () => {
//     // Check if any editing is in progress
//     if (isEditingExpression || isEditingSysAction) {
//       toast.error("Please finish editing before closing the dialog");
//       return;
//     }

//     handleShowBWFDialog(false, null);
//     setSelectedAdvancedRules(null);
//     resetFormState();
//   };

//   const handleFormFieldChange = (field: keyof BWFProps, value: any) => {
//     setFormField((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Check if any editing is in progress
//     if (isEditingExpression) {
//       toast.error("Please finish creating or editing Expression conditions before saving");
//       return;
//     }

//     if (isEditingSysAction) {
//       toast.error("Please finish creating or editing a System Action before saving");
//       return;
//     }

//     if (!formField.effDate) {
//       toast.error("Effective Date is required");
//       return;
//     }

//     if (!formField.sortRuleName) {
//       toast.error("Step name is required");
//       return;
//     }

//     setLoading(true);

//     try {
//       const payload = {
//         ...formField,
//         triggerId: formField.triggerId,
//         seq: formField.seq,
//       };

//       let res;

//       // Check if stepId exists to determine which API to use
//       if (workflowList?.stepId) {
//         // Use PUT API if stepId exists
//         res = await PutData(`${API_URL}/trigger/advance-rule/bwf/edit/${workflowList.stepId}`, payload);
//       } else {
//         // Use POST API if stepId is null/undefined
//         res = await PostData(`${API_URL}/trigger/advance-rule/bwf/add`, payload);
//       }

//       if (res?.status || res?.message?.includes("success")) {
//         const actionType = workflowList?.stepId ? "updated" : "created";
//         toast.success(`Advanced Rule ${actionType} successfully!`);
//         handleCloseDialog();
//         onRefresh();
//       } else {
//         toast.error(res?.message || "Failed to process rule");
//       }
//     } catch (err) {
//       console.error("Error processing advanced rule:", err);
//       toast.error("Error processing form");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isInitialLoading = workflowLoading || detailBWFLoading;

//   return (
//     <Dialog
//       open={showBWFDialog}
//       onOpenChange={(open) => {
//         if (!open) {
//           handleCloseDialog();
//         }
//       }}
//     >
//       <DialogContent className="max-w-screen-2xl max-h-[95vh] overflow-hidden flex flex-col">
//         <DialogHeader className="pb-6 border-b border-gray-100">
//           <DialogTitle className="text-xl font-semibold text-gray-800">Conditions of Advanced Rules</DialogTitle>
//           <DialogDescription className="text-gray-600 mt-2">
//             {isInitialLoading && <span className="text-blue-600">Loading BWF data...</span>}
//             {(isEditingExpression || isEditingSysAction) && <span className="text-orange-600 font-medium">⚠️ Editing in progress - Please save changes before closing</span>}
//           </DialogDescription>
//         </DialogHeader>

//         {isInitialLoading ? (
//           <div className="flex-1 flex items-center justify-center">
//             <div className="text-center">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//               <p className="text-gray-600">Loading workflow and BWF details...</p>
//             </div>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
//             <div className="flex-1 overflow-y-auto py-6">
//               <div className="space-y-8">
//                 {/* Basic Form Fields */}
//                 <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
//                   <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Basic Information</h3>

//                   {/* Sort Rule Name - Full Width */}
//                   <div className="mb-6">
//                     <div className="space-y-2">
//                       <Label>
//                         Step Name <span className="text-red-500">*</span>
//                       </Label>
//                       <Input
//                         className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full"
//                         type="text"
//                         step={1}
//                         value={formField.sortRuleName}
//                         onChange={(e) => handleFormFieldChange("sortRuleName", e.target.value)}
//                         disabled={isEditingExpression || isEditingSysAction}
//                       />
//                     </div>
//                   </div>

//                   {/* Date Fields - Side by Side */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">
//                         Start Time <span className="text-red-500">*</span>
//                       </Label>
//                       <Input
//                         type="datetime-local"
//                         step={1}
//                         value={formField.effDate}
//                         onChange={(e) => {
//                           handleFormFieldChange("effDate", e.target.value);
//                           e.target.blur();
//                         }}
//                         className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full"
//                         disabled={isEditingExpression || isEditingSysAction}
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label className="text-sm font-medium text-gray-700">End Time</Label>
//                       <Input
//                         type="datetime-local"
//                         value={formField.expDate ?? ""}
//                         onChange={(e) => {
//                           handleFormFieldChange("expDate", e.target.value);
//                           e.target.blur();
//                         }}
//                         className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full"
//                         disabled={isEditingExpression || isEditingSysAction}
//                       />
//                     </div>
//                   </div>

//                   {/* Remarks - Full Width */}
//                   <div className="space-y-2">
//                     <Label>Remarks</Label>
//                     <Textarea
//                       className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-full h-28"
//                       value={formField.comments ?? ""}
//                       onChange={(e) => handleFormFieldChange("comments", e.target.value)}
//                       disabled={isEditingExpression || isEditingSysAction}
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="flex-1 overflow-hidden flex flex-col">
//                 {/* Tab Navigation */}
//                 <div className="flex border-b border-gray-200 mb-6 bg-gray-50/50">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       if (isEditingExpression || isEditingSysAction) {
//                         toast.error("Please finish editing before switching tabs");
//                         return;
//                       }
//                       setActiveTab("expression");
//                     }}
//                     className={`relative px-8 py-4 text-sm font-semibold transition-all duration-200 ${
//                       activeTab === "expression" ? "text-blue-600 bg-white border-b-2 border-blue-500 shadow-sm" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/50"
//                     }`}
//                   >
//                     <span className="flex items-center gap-2">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
//                         />
//                       </svg>
//                       Expression
//                       {isEditingExpression && <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs bg-orange-100 text-orange-800">Editing</span>}
//                     </span>
//                     {activeTab === "expression" && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500"></div>}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       if (isEditingExpression || isEditingSysAction) {
//                         toast.error("Please finish editing before switching tabs");
//                         return;
//                       }
//                       setActiveTab("result");
//                     }}
//                     className={`relative px-8 py-4 text-sm font-semibold transition-all duration-200 ${
//                       activeTab === "result" ? "text-blue-600 bg-white border-b-2 border-blue-500 shadow-sm" : "text-gray-600 hover:text-gray-800 hover:bg-gray-100/50"
//                     }`}
//                   >
//                     <span className="flex items-center gap-2">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       Result
//                       {isEditingSysAction && <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs bg-orange-100 text-orange-800">Editing</span>}
//                     </span>
//                     {activeTab === "result" && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500"></div>}
//                   </button>
//                 </div>

//                 {/* Tab Content */}
//                 <div className="flex-1 overflow-y-auto">
//                   <div className={`transition-all duration-300 ${activeTab === "expression" ? "block" : "hidden"}`}>
//                     <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
//                       <div className="mb-4">
//                         <h3 className="text-lg font-semibold text-gray-800 mb-2">Expression Configuration</h3>
//                         <p className="text-sm text-gray-600">Define the conditions and expressions for your advanced rule.</p>
//                       </div>
//                       <ExpressionTab bwfCondGroupList={formField.bwfCondGroupList} onConditionChange={handleConditionChange} spId={formField.spId ?? 0} onEditingChange={setIsEditingExpression} />
//                     </div>
//                   </div>

//                   <div className={`transition-all duration-300 ${activeTab === "result" ? "block" : "hidden"}`}>
//                     <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
//                       <div className="mb-4">
//                         <h3 className="text-lg font-semibold text-gray-800 mb-2">Result Configuration</h3>
//                         <p className="text-sm text-gray-600">Configure the actions and results that will be executed when conditions are met.</p>
//                       </div>
//                       <ResultTab
//                         bwfActionList={formField.bwfActionList || []}
//                         bwfSysActionDto={formField.bwfSysActionDto}
//                         onConditionChange={(sysActionDto, actionList) => {
//                           setFormField((prev) => ({
//                             ...prev,
//                             bwfSysActionDto: sysActionDto,
//                             bwfActionList: actionList,
//                           }));
//                         }}
//                         onEditingChange={setIsEditingSysAction}
//                         scriptToChange={scriptToChange} // Pass scriptToChange to ResultTab
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <DialogFooter className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-4">
//               <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={loading} className="hover:bg-gray-50 transition-colors">
//                 Cancel
//               </Button>
//               <Button type="submit" disabled={loading || templateFieldsLoading || isInitialLoading} className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-sm hover:shadow-md transition-all">
//                 {loading ? "Updating..." : "Update Advanced Rules"}
//               </Button>
//             </DialogFooter>
//           </form>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default BwfDialog;
