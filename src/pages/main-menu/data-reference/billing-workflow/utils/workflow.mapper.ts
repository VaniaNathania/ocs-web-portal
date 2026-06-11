import { Node, Edge } from "@xyflow/react";
import {
  BackendMainNode,
  WorkflowDefinition,
  IStepNode,
} from "./workflow.data";
import { BwfActionDetail, BwfCondGroupDetail } from "../api/type";
import { BwfActionList, BwfCondGroupListPayload } from "../hooks/stepForm";

export const mapWorkflowToFlow = (
  workflow: WorkflowDefinition
): { nodes: Node[]; edges: Edge[] } => {
  const nodes: Node[] = workflow.steps.map((step, index) => ({
    id: step.id,
    type: "MainWorkflow",
    position: { x: index * 220, y: 80 },
    data: {
      id: step.id,
      label: step.label,
      status: step.status,
      variants: "workflowNode",
    },
  }));

  const edges: Edge[] = workflow.steps.slice(1).map((step, index) => ({
    id: `e-${workflow.steps[index].id}-${step.id}`,
    source: workflow.steps[index].id,
    target: step.id,
    targetHandle: "input-left",
    sourceHandle: "output-right",
  }));

  return { nodes, edges };
};

export const mapBackendNodesToWorkflow = (
  workflowId: string,
  name: string,
  backendNodes: BackendMainNode[]
): WorkflowDefinition => {
  return {
    id: workflowId,
    name,
    steps: backendNodes.map((node) => ({
      id: String(node.id),
      label: node.nodeName,
      status: node.firstNode === "Y" ? "A" : "B",
    })),
  };
};

export const mapBackendConnectionsToCanvas = (
  mainNodes: BackendMainNode[],
  stepNodes: IStepNode[]
): {
  title: string;
  mainNode: BackendMainNode;
  nodes: Node[];
  edges: Edge[];
}[] => {
  const safeMainNodes = mainNodes || [];
  const safeStepNodes = stepNodes || [];

  return safeMainNodes.map((mainNode) => {
    // 1️⃣ ambil step untuk main node ini
    const steps = safeStepNodes
      .filter((s) => s.inputNodeId === mainNode.id)
      .sort((a, b) => a.execOrder - b.execOrder);
    // console.log("steps: ", steps);
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    let x = 0;
    const yMain = 80;
    const yOutput = 160;

    // 2️⃣ MAIN NODE
    nodes.push({
      id: `main-${mainNode.id}`,
      type: "PreProcessing",
      position: { x, y: yMain },
      data: {
        label: mainNode.nodeName,
        status: "A",
        variants: "mainNode",
        data: mainNode,
      },
    });

    let prevNodeId = `main-${mainNode.id}`;
    x += 220;

    // 3️⃣ STEP NODES (horizontal)
    steps.forEach((step, index) => {
      const stepNodeId = `step-${step.stepId}`;

      nodes.push({
        id: stepNodeId,
        type: "PreProcessing",
        position: { x, y: yMain },
        data: {
          label: step.sortRuleName,
          status: step.outputNodeId ? "B" : "A",
          variants: "stepNode",
          data: step,
        },
      });

      edges.push({
        id: `e-${prevNodeId}-${stepNodeId}`,
        target: stepNodeId,
        source: prevNodeId,
        targetHandle: "input-left",
        sourceHandle: "output-right",
        type: "smoothstep",
      });

      // 4️⃣ OUTPUT NODE (ke bawah)
      if (step.outputNodeId) {
        const outputNodeId = `output-${step.outputNodeId}`;

        nodes.push({
          id: outputNodeId,
          type: "PreProcessing",
          position: { x, y: yOutput },
          data: {
            label: step.outputNodeName ?? "Output",
            status: "B",
            variants: "outputNode",
            data: step,
          },
        });

        edges.push({
          id: `e-${stepNodeId}-${outputNodeId}`,
          target: outputNodeId,
          source: stepNodeId,
          targetHandle: "input-top",
          sourceHandle: "output-bot",
          type: "smoothstep",
        });
      }

      prevNodeId = stepNodeId;
      x += 220;
    });

    return {
      title: mainNode.nodeName,
      mainNode,
      nodes,
      edges,
    };
  });
};

export const mapCondGroupDetailToPayload = (
  groups: BwfCondGroupDetail[],
  spId?: number
): BwfCondGroupListPayload[] => {
  return groups.map((group) => ({
    stepId: group.stepId,
    spId: spId || 0,
    bwfCondList: [
      {
        reAttr: Number(group.reAttr),
        function: group.function,
        param1: group.param1,
        param2: group.param2,
        sortOperator: group.sortOperator,
        isConst: group.isConst,
        operand: group.operand,
        zoneId: group.zoneId ?? undefined,
        functionScript: group.functionScript,
        spId: 0,
        rreAttr: group.rreAttr ? Number(group.rreAttr) : undefined,
        rfunction: group.rfunction,
        rparam1: group.rparam1,
        rparam2: group.rparam2,
        rfunctionScript: group.rfunctionScript,
      },
    ],
  }));
};

export const mapActionDetailToPayload = (
  actions: BwfActionDetail[]
): BwfActionList[] => {
  return actions.map((a) => ({
    stepId: a.stepId,
    seq: a.seq,
    srcReAttr: Number(a.srcReAttr),
    objReAttr: Number(a.objReAttr),
    function: a.function,
    param1: a.param1,
    param2: a.param2,
    functionScript: null,
    spId: 0,
  }));
};
