import { useCallback, useState } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  Controls,
  MarkerType,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import WorkflowNode from "./nodes/WorkflowNode";

const nodeTypes = {
  MainWorkflow: WorkflowNode,
  PreProcessing: WorkflowNode,
};

type CanvasProps = {
  nodes: Node[];
  edges: Edge[];
};

const Canvas = ({ nodes: initialNodes, edges: initialEdges }: CanvasProps) => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        defaultViewport={{ x: 30, y: 0, zoom: 1 }}
        defaultEdgeOptions={{
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
        // fitView
        // fitViewOptions={{ minZoom: 0.85, maxZoom: 1 }}
      >
        <Background gap={16} />
        <Controls position="bottom-right" />
      </ReactFlow>
    </div>
  );
};

export default Canvas;
