import {
  addEdge,
  ReactFlow,
  Background,
  Controls,
  type Edge,
  type Node,
} from "@xyflow/react";
import { useCallback, useState } from "react";
import { mockGraph, mockProdState } from "../../mock";
import { useLifeCycle } from "../hooks/context";
import { KeenIcon } from "@/components";
import { RectNode } from "./nodeLifecycle";
import { Button } from "@/components/ui/button";
import { Loading } from "@/pages/main-menu/role-management/block/loadingBlock";
import EdgeDialog from "./edgedialog/EdgeDialog";
import flowToJson from "../hooks/flowToJson";
import { useCallApi } from "@/hooks";
import { apiConfigRef } from "@/config/api.config";
import { toast } from "sonner";
import "@xyflow/react/dist/style.css";
import { AccessWrapper } from "@/pages/main-menu/role-management/hook/useRoleCheck";

const nodeTypes = {
  rect: RectNode,
};

const API_URL = apiConfigRef.ref;

const CanvasLifecycle = () => {
  const {
    edges,
    nodes,
    addNode,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    setIsEditing,
    isEditing,
    isLoading,
    selectedLifeCycle,
    setSelectedEdge,
    setEdgeDialog,
    RefreshCanvas,
    setRefreshSidebar,
    prods,
    setIsLoading,
    menuPrivAccess,
  } = useLifeCycle();
  const { PutData } = useCallApi();

  const [isAdding, setIsAdding] = useState<boolean>(true);

  const onEdgeDoubleClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    //  console.log("Double clicked edge:", edge);
    setSelectedEdge(edge);
    setEdgeDialog(true);
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    //  console.log("clicked node:", node);
    setSelectedNode(node);
  }, []);

  const SaveGraph = async () => {
    try {
      setIsLoading(true);
      const strGraph = flowToJson({
        nodes,
        edges,
        lifeCycle: selectedLifeCycle,
      });
      const payload = {
        lifeCycleType: selectedLifeCycle?.lifeCycleType,
        spId: 0,
        extAttr: strGraph,
      };

      const resp = await PutData(
        `${API_URL}/api/lifecycle-type/mod-lifecycle-type-ext-attr`,
        payload,
      );

      if (resp?.status) {
        setIsEditing(false);
        setRefreshSidebar((prev) => prev + 1);

        return toast.success(resp.message);
      }
      return toast.error(resp?.message);
    } catch (error) {
      toast.error("failed to save graph");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full relative">
      {isLoading && <Loading />}
      {/* Toolbar */}
      <div className="absolute bottom-2 right-2 z-50 flex gap-2 ">
        {!isEditing ? (
          <div className="flex flex-row bg-white shadow-md rounded-md p-2">
            <AccessWrapper hasAccess={menuPrivAccess.editStatus ?? false}>
              <Button
                size={"sm"}
                variant={"ghost"}
                onClick={() => {
                  //  console.log("edit");
                  setIsEditing(true);
                }}
                disabled={!selectedLifeCycle}
              >
                <KeenIcon icon="notepad-edit" />
              </Button>
            </AccessWrapper>
          </div>
        ) : (
          <div className="flex flex-row gap-2 ">
            <div className="bg-white shadow-md rounded-md p-2 flex items-center">
              you can delete using backspace or delete key
            </div>
            <div className="flex flex-row gap-2 bg-white shadow-md rounded-md p-2">
              <AccessWrapper hasAccess={menuPrivAccess.editStatus ?? false}>
                <Button
                  size={"sm"}
                  onClick={() => {
                    // console.log("saving");
                    SaveGraph();
                  }}
                >
                  Save
                </Button>
              </AccessWrapper>
              <Button
                size={"sm"}
                variant={"outline"}
                onClick={() => {
                  RefreshCanvas();
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
      <EdgeDialog />
      {isEditing && (
        <div
          className={`absolute top-2 right-2 z-10 gap-2 rounded-md flex flex-col`}
        >
          <div className="flex justify-end">
            <Button size={"sm"} onClick={() => setIsAdding(!isAdding)}>
              <KeenIcon
                icon="down"
                className={`transition-all duration-300 ${isAdding ? "rotate-180" : "rotate-0"}`}
              />
            </Button>
          </div>
          <div
            className={`grid grid-cols-1 gap-2 bg-white shadow-md overflow-hidden transition-all duration-300 ${isAdding ? "w-40 h-80 p-4 " : "w-0 h-0 p-0"}`}
          >
            {prods.map((item, index) => {
              return (
                <AccessWrapper hasAccess={menuPrivAccess.editStatus ?? false}>
                  <Button onClick={() => addNode(item)} size={"sm"} key={index}>
                    {item.prodStateName}
                  </Button>
                </AccessWrapper>
              );
            })}
          </div>
        </div>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        // edgeTypes={edgeTypes}
        elementsSelectable
        nodesDraggable={isEditing}
        onNodeDragStart={(_, n) => {
          //  console.log("start", n);
        }}
        onNodeDragStop={(_, n) => {
          //  console.log("end", n);
        }}
        elevateEdgesOnSelect
        nodesConnectable
        deleteKeyCode={isEditing ? ["Delete", "Backspace"] : []}
        onNodeClick={onNodeClick}
        onEdgeClick={() => setSelectedNode(undefined)}
        onEdgeDoubleClick={onEdgeDoubleClick}
        fitView={true}
      >
        <Controls />
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
};

export default CanvasLifecycle;
