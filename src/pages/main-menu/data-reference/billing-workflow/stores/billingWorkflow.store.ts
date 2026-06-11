import { create } from "zustand";
import {
  BackendMainNode,
  IStepNode,
  IWorkflowType,
} from "../utils/workflow.data";
import { BwfCondListPayload } from "../hooks/stepForm";

interface BillingWorkflowState {
  showWorkflowDialog: { show: boolean; mode: "create" | "update" };
  showMainDialog: { show: boolean; mode: "create" | "update" };
  showStepDialog: { show: boolean; mode: "create" | "update" };
  showStepCopyDialog: { show: boolean; parentNodeId?: number };
  showNodeCopyDialog: boolean;
  showFormCondition: boolean;
  selectedWorkflow: IWorkflowType | null;
  selectedWorkflowId: number | null;
  selectedWorkFlowType: string | null;
  selectedMainNode: BackendMainNode | null;
  selectedStepNode: { parentNodeId?: number; data: IStepNode | null };
  editingCondition: { groupIndex: number; conditionIndex: number } | null;
  tempConditionGroup: BwfCondListPayload | null;

  openWorkflowDialog: (
    mode: "create" | "update"
    // data?: IWorkflowType | null
  ) => void;
  openMainDialog: (
    mode: "create" | "update",
    data?: BackendMainNode | null
  ) => void;
  openStepDialog: (
    mode: "create" | "update",
    parentNodeId?: number,
    data?: IStepNode | null
  ) => void;
  closeWorkflowDialog: () => void;
  closeMainDialog: () => void;
  closeStepDialog: () => void;
  setSelectedWorkflow: (data: BillingWorkflowState["selectedWorkflow"]) => void;
  setSelectedWorkflowId: (id: number | null) => void;
  setSelectedWorkFlowType: (type: string | null) => void;
  setSelectedMainNode: (data: BillingWorkflowState["selectedMainNode"]) => void;
  setSelectedStepNode: (data: BillingWorkflowState["selectedStepNode"]) => void;
  setShowStepCopyDialog: (show: boolean, parentNodeId?: number) => void;
  setShowNodeCopyDialog: (show: boolean) => void;
  setShowFormCondition: (show: boolean) => void;
  setEditingCondition: (
    condition: BillingWorkflowState["editingCondition"]
  ) => void;
  setTempConditionGroup: (
    data: BillingWorkflowState["tempConditionGroup"]
  ) => void;
}

export const useBillingWorkflowStore = create<BillingWorkflowState>((set) => ({
  showWorkflowDialog: { show: false, mode: "create" },
  showMainDialog: { show: false, mode: "create" },
  showStepDialog: { show: false, mode: "create" },
  showStepCopyDialog: { show: false, parentNodeId: undefined },
  showNodeCopyDialog: false,
  showFormCondition: false,
  selectedWorkflow: null,
  selectedWorkflowId: null,
  selectedWorkFlowType: null,
  selectedMainNode: null,
  selectedStepNode: { data: null, parentNodeId: undefined },
  editingCondition: null,
  tempConditionGroup: null,

  setSelectedWorkflow: (data) => set({ selectedWorkflow: data }),
  setSelectedWorkflowId: (id) => set({ selectedWorkflowId: id }),
  setSelectedWorkFlowType: (type) => set({ selectedWorkFlowType: type }),
  setSelectedMainNode: (data) => set({ selectedMainNode: data }),
  setSelectedStepNode: (data) => set({ selectedStepNode: data }),
  setEditingCondition: (condition) => set({ editingCondition: condition }),
  setTempConditionGroup: (data) => set({ tempConditionGroup: data }),

  setShowStepCopyDialog: (show, parentNodeId) => set({ showStepCopyDialog: { show, parentNodeId } }),
  setShowNodeCopyDialog: (show) => set({ showNodeCopyDialog: show }),
  setShowFormCondition: (show) => set({ showFormCondition: show }),

  openWorkflowDialog: (mode) =>
    set({ showWorkflowDialog: { show: true, mode } }),
  openMainDialog: (mode, data) =>
    set({
      showMainDialog: { show: true, mode },
      selectedMainNode: data ?? null,
    }),
  openStepDialog: (mode, parentNodeId, data) =>
    set({
      showStepDialog: { show: true, mode },
      selectedStepNode: { parentNodeId, data: data ?? null },
    }),
  closeWorkflowDialog: () =>
    set({ showWorkflowDialog: { show: false, mode: "create" } }),
  closeMainDialog: () =>
    set({ showMainDialog: { show: false, mode: "create" } }),
  closeStepDialog: () =>
    set({
      showStepDialog: { show: false, mode: "create" },
      selectedStepNode: { parentNodeId: undefined, data: null },
    }),
}));
