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
import { useCopyMainNode } from "../hooks/useQuery";
import {
  useBillingWorkflowApi,
  useWorkflowAdditionalApi,
} from "../api/useBillingWorkflowAPI";
import {
  IWorkflowType,
  BackendMainNode,
} from "../utils/workflow.data";
import { Loader } from "@/components/common/Loading";

export default function NodeSelector() {
  const { showNodeCopyDialog, setShowNodeCopyDialog, selectedWorkflow } =
    useBillingWorkflowStore();
  const { GetWorkflowNode } = useBillingWorkflowApi();
  const { WorkflowRuleList } = useWorkflowAdditionalApi();
  const { mutateAsync: copyMainNode, isPending: isCopying } = useCopyMainNode(
    selectedWorkflow?.id || null
  );

  // --- API data states ---
  const [workflows, setWorkflows] = useState<IWorkflowType[]>([]);
  const [nodes, setNodes] = useState<BackendMainNode[]>([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);
  const [isLoadingNodes, setIsLoadingNodes] = useState(false);

  // --- Selection states ---
  const [selectedWorkflowItem, setSelectedWorkflowItem] =
    useState<IWorkflowType | null>(null);
  const [selectedNode, setSelectedNode] = useState<BackendMainNode | null>(
    null
  );

  // --- Search states ---
  const [searchWorkflow, setSearchWorkflow] = useState("");
  const [searchNode, setSearchNode] = useState("");

  // Fetch workflows when dialog opens
  useEffect(() => {
    if (showNodeCopyDialog) {
      fetchWorkflows();
    }
  }, [showNodeCopyDialog]);

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

  const handleWorkflowClick = async (workflow: IWorkflowType) => {
    setSelectedWorkflowItem(workflow);
    setSelectedNode(null);
    setSearchNode("");

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

  const handleNodeClick = (node: BackendMainNode) => {
    setSelectedNode(node);
  };

  const handleOk = async () => {
    if (!selectedNode || !selectedWorkflowItem || !selectedWorkflow) return;

    try {
      await copyMainNode({
        nodeId: 0,
        workFlowId: selectedWorkflow.id,
        nodeName: selectedNode.nodeName,
        firstNode: "N",
        spId: selectedNode.spId || 0,
        cpSrcNodeId: selectedNode.id,
      });
      handleClose();
    } catch (error) {
      console.error("Copy main node failed:", error);
    }
  };

  const handleClose = () => {
    setSelectedWorkflowItem(null);
    setSelectedNode(null);
    setWorkflows([]);
    setNodes([]);
    setSearchWorkflow("");
    setSearchNode("");
    setShowNodeCopyDialog(false);
  };

  return (
    <Dialog open={showNodeCopyDialog} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Node Selector (Copy)
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 py-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
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
                      setNodes([]);
                      setSearchNode("");
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
          </div>

          {/* Selection Summary */}
          {selectedNode && selectedWorkflowItem && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Selected:</span> Node "
                {selectedNode.nodeName}"
                <span className="text-gray-500"> from Workflow </span>
                <span className="font-medium">
                  "{selectedWorkflowItem.workflowName}"
                </span>
                <span className="text-gray-500">
                  {" "}
                  → will be copied to current workflow "
                  {selectedWorkflow?.workflowName}"
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={handleClose} className="px-6">
            Cancel
          </Button>
          <Button
            onClick={handleOk}
            disabled={
              !selectedNode || !selectedWorkflowItem || isCopying
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
