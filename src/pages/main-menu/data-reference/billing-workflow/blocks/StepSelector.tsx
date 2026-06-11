import React, { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBillingWorkflowStore } from "../stores/billingWorkflow.store";
import { useCopyStepNode } from "../hooks/useQuery";
import {
  useBillingWorkflowApi,
  useWorkflowAdditionalApi,
} from "../api/useBillingWorkflowAPI";
import { toast } from "sonner";
import {
  mapActionDetailToPayload,
  mapCondGroupDetailToPayload,
} from "../utils/workflow.mapper";
import { toDateOnly } from "@/utils/Date";
import {
  IWorkflowType,
  BackendMainNode,
  IStepNode,
} from "../utils/workflow.data";
import { Loader } from "@/components/common/Loading";

export default function StepSelector() {
  const { showStepCopyDialog, setShowStepCopyDialog, selectedWorkflow } =
    useBillingWorkflowStore();
  const { GetWorkflowNode, GetStepNode, GetDetailStepNode } =
    useBillingWorkflowApi();
  const { WorkflowRuleList } = useWorkflowAdditionalApi();
  const { mutateAsync: copyStepNode, isPending: isCopying } = useCopyStepNode(
    selectedWorkflow?.id || null
  );

  // --- API data states ---
  const [workflows, setWorkflows] = useState<IWorkflowType[]>([]);
  const [nodes, setNodes] = useState<BackendMainNode[]>([]);
  const [steps, setSteps] = useState<IStepNode[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [isLoadingNodes, setIsLoadingNodes] = useState(false);
  const [isLoadingSteps, setIsLoadingSteps] = useState(false);

  // --- Selection states ---
  const [selectedWorkflowItem, setSelectedWorkflowItem] =
    useState<IWorkflowType | null>(null);
  const [selectedNode, setSelectedNode] = useState<BackendMainNode | null>(
    null
  );
  const [selectedStep, setSelectedStep] = useState<IStepNode | null>(null);

  // --- Search states ---
  const [searchWorkflow, setSearchWorkflow] = useState("");
  const [searchNode, setSearchNode] = useState("");
  const [searchStep, setSearchStep] = useState("");

  // Fetch workflows when dialog opens
  useEffect(() => {
    if (showStepCopyDialog.show) {
      fetchWorkflows();
    }
  }, [showStepCopyDialog.show]);

  const fetchWorkflows = async () => {
    setIsLoadingWorkflows(true);
    try {
      const data = await WorkflowRuleList({});
      setWorkflows(data || []);
    } catch {
      setWorkflows([]);
    }
    setIsLoadingWorkflows(false);
  };

  // Filter workflows by search
  const filteredWorkflows = useMemo(() => {
    if (!searchWorkflow) return workflows;
    return workflows.filter((w) =>
      w.workflowName.toLowerCase().includes(searchWorkflow.toLowerCase())
    );
  }, [workflows, searchWorkflow]);

  // Filter nodes by search
  const filteredNodes = useMemo(() => {
    if (!searchNode) return nodes;
    return nodes.filter((n) =>
      n.nodeName.toLowerCase().includes(searchNode.toLowerCase())
    );
  }, [nodes, searchNode]);

  // Filter steps by search
  const filteredSteps = useMemo(() => {
    if (!searchStep) return steps;
    return steps.filter((s) =>
      s.sortRuleName.toLowerCase().includes(searchStep.toLowerCase())
    );
  }, [steps, searchStep]);

  const handleWorkflowClick = async (workflow: IWorkflowType) => {
    setSelectedWorkflowItem(workflow);
    setSelectedNode(null);
    setSelectedStep(null);
    setSearchNode("");
    setSearchStep("");
    setSteps([]);

    // Fetch nodes for this workflow
    setIsLoadingNodes(true);
    try {
      const response = await GetWorkflowNode({ workflowId: workflow.id });
      if (response?.status && response.data) {
        setNodes(response.data);
      } else {
        setNodes([]);
      }
    } catch {
      setNodes([]);
    }
    setIsLoadingNodes(false);
  };

  const handleNodeClick = async (node: BackendMainNode) => {
    setSelectedNode(node);
    setSelectedStep(null);
    setSearchStep("");

    // Fetch steps for this node
    setIsLoadingSteps(true);
    try {
      const response = await GetStepNode({ nodeId: node.id });
      if (response?.status && response.data) {
        setSteps(response.data);
      } else {
        setSteps([]);
      }
    } catch {
      setSteps([]);
    }
    setIsLoadingSteps(false);
  };

  const handleStepClick = (step: IStepNode) => {
    setSelectedStep(step);
  };

  const handleOk = async () => {
    if (!selectedStep || !selectedNode || !selectedWorkflowItem) return;

    try {
      // Fetch full detail of the selected step
      const response = await GetDetailStepNode(selectedStep.stepId);

      if (!response.status) {
        toast.error(response.message || "Failed to fetch step detail");
        return;
      }

      const parsed = response.data;

      // Build copy payload, overriding nodeId with the target parent node
      const copyPayload = {
        stepId: 0,
        nodeId: showStepCopyDialog.parentNodeId || parsed.nodeId,
        outputNodeId: parsed.outputNodeId || 0,
        sortRuleName: parsed.sortRuleName,
        comments: parsed.comments,
        execOrder: parsed.execOrder,
        effDate: toDateOnly(parsed.effDate),
        expDate: parsed.expDate,
        spId: parsed.spId || 0,
        bwfCondGroupList: mapCondGroupDetailToPayload(parsed.bwfCondGroupList),
        bwfActionList: mapActionDetailToPayload(parsed.bwfActionList),
        bwfSysAction: parsed.bwfSysAction,
      };

      await copyStepNode(copyPayload);
      handleClose();
    } catch (error) {
      console.error("Copy step node failed:", error);
    }
  };

  const handleCancel = () => {
    handleClose();
  };

  const handleClose = () => {
    setSelectedWorkflowItem(null);
    setSelectedNode(null);
    setSelectedStep(null);
    setWorkflows([]);
    setNodes([]);
    setSteps([]);
    setSearchWorkflow("");
    setSearchNode("");
    setSearchStep("");
    setShowStepCopyDialog(false);
  };

  return (
    <Dialog open={showStepCopyDialog.show} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Step Selector
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
            {/* Workflow Table */}
            <div className="flex flex-col border rounded-lg overflow-hidden bg-white">
              <div className="p-3 border-b bg-gray-50">
                <h3 className="font-semibold text-sm mb-2 text-gray-700">
                  Workflow Name
                </h3>
                <div className="relative">
                  <Input
                    placeholder="Search workflow..."
                    value={searchWorkflow}
                    onChange={(e) => {
                      setSearchWorkflow(e.target.value);
                      setSelectedWorkflowItem(null);
                      setSelectedNode(null);
                      setSelectedStep(null);
                      setNodes([]);
                      setSteps([]);
                      setSearchNode("");
                      setSearchStep("");
                    }}
                    className="pr-8 h-9 text-sm"
                  />
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {isLoadingWorkflows ? (
                  <div className="flex items-center justify-center h-full py-8">
                    <Loader title="Loading workflows..." />
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="border-b">
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Workflow Name
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkflows.length > 0 ? (
                        filteredWorkflows.map((workflow) => (
                          <tr
                            key={workflow.id}
                            onClick={() => handleWorkflowClick(workflow)}
                            className={`border-b cursor-pointer transition-colors ${
                              selectedWorkflowItem?.id === workflow.id
                                ? "bg-blue-50 hover:bg-blue-100"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-3 py-2.5">
                              {workflow.workflowName}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-8 text-center text-gray-500 text-sm">
                            No workflows found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Node Table */}
            <div className="flex flex-col border rounded-lg overflow-hidden bg-white">
              <div className="p-3 border-b bg-gray-50">
                <h3 className="font-semibold text-sm mb-2 text-gray-700">
                  Node Name
                </h3>
                <div className="relative">
                  <Input
                    placeholder="Search node..."
                    value={searchNode}
                    onChange={(e) => {
                      setSearchNode(e.target.value);
                      setSelectedNode(null);
                      setSelectedStep(null);
                      setSteps([]);
                      setSearchStep("");
                    }}
                    disabled={!selectedWorkflowItem}
                    className="pr-8 h-9 text-sm"
                  />
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {!selectedWorkflowItem ? (
                  <div className="flex items-center justify-center h-full text-sm text-gray-500">
                    Select a workflow first
                  </div>
                ) : isLoadingNodes ? (
                  <div className="flex items-center justify-center h-full py-8">
                    <Loader title="Loading nodes..." />
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="border-b">
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Node Name
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNodes.length > 0 ? (
                        filteredNodes.map((node) => (
                          <tr
                            key={node.id}
                            onClick={() => handleNodeClick(node)}
                            className={`border-b cursor-pointer transition-colors ${
                              selectedNode?.id === node.id
                                ? "bg-blue-50 hover:bg-blue-100"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-3 py-2.5">{node.nodeName}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-3 py-8 text-center text-gray-500 text-sm">
                            No nodes found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Step Table */}
            <div className="flex flex-col border rounded-lg overflow-hidden bg-white min-h-0">
              <div className="p-3 border-b bg-gray-50">
                <h3 className="font-semibold text-sm mb-2 text-gray-700">
                  Step Name
                </h3>
                <div className="relative">
                  <Input
                    placeholder="Search step..."
                    value={searchStep}
                    onChange={(e) => setSearchStep(e.target.value)}
                    disabled={!selectedNode}
                    className="pr-8 h-9 text-sm"
                  />
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                {!selectedNode ? (
                  <div className="flex items-center justify-center h-full text-sm text-gray-500">
                    Select a node first
                  </div>
                ) : isLoadingSteps ? (
                  <div className="flex items-center justify-center h-full py-8">
                    <Loader title="Loading steps..." />
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="border-b">
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Step Name
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Order
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSteps.length > 0 ? (
                        filteredSteps.map((step) => (
                          <tr
                            key={step.stepId}
                            onClick={() => handleStepClick(step)}
                            className={`border-b cursor-pointer transition-colors ${
                              selectedStep?.stepId === step.stepId
                                ? "bg-blue-50 hover:bg-blue-100"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-3 py-2.5">
                              {step.sortRuleName}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              {step.execOrder}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
                            className="px-3 py-8 text-center text-gray-500 text-sm"
                          >
                            No steps found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Selection Summary */}
          {selectedStep && selectedNode && selectedWorkflowItem && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Selected:</span> Step "
                {selectedStep.sortRuleName}"
                <span className="text-gray-500"> from Node </span>
                <span className="font-medium">
                  "{selectedNode.nodeName}"
                </span>
                <span className="text-gray-500"> in Workflow </span>
                <span className="font-medium">
                  "{selectedWorkflowItem.workflowName}"
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={handleCancel} className="px-6">
            Cancel
          </Button>
          <Button
            onClick={handleOk}
            disabled={
              !selectedStep ||
              !selectedNode ||
              !selectedWorkflowItem ||
              isCopying
            }
            className="px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isCopying ? "Copying..." : "OK"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
