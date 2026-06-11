import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useLifeCycle } from "../hooks/context";
import { ChildGraph } from "../interface";
import { Button } from "@/components/ui/button";
import { DefaultTooltip, KeenIcon } from "@/components";

const sharedStyle = {
  left: "50%",
  transform: "translateX(-50%)",
};

export interface nodeData {
  label: string;
  jsonData?: ChildGraph;
}

export function RectNode({ id, data }: any) {
  const { selectedNode, isEditing } = useLifeCycle();
  const { deleteElements } = useReactFlow();

  const { label, jsonData } = data as nodeData;

  const isSelected = selectedNode?.id === jsonData?.options.id;

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div
      className={`relative p-2 rounded-md min-w-[120px] text-center bg-white shadow-md
        transition-all duration-100
        ${isSelected ? "border-4 border-primary-clarity" : "border-2 border-primary-light"}`}
    >
      {/* Delete button */}
      {isSelected && isEditing && (
        <DefaultTooltip title="Delete Node" placement="top">
          <Button
            onClick={handleDelete}
            size={"sm"}
            variant={"ghost"}
            className="absolute -bottom-8 right-0 translate-x-1/2 translate-y-1/2 p-2"
            // title="Delete Node"
          >
            <KeenIcon icon="trash" />
          </Button>
        </DefaultTooltip>
      )}

      {label}

      {/* TOP */}
      <Handle
        id="top-target"
        type="target"
        position={Position.Top}
        style={sharedStyle}
      />
      <Handle
        id="top-source"
        type="source"
        position={Position.Top}
        style={sharedStyle}
      />

      {/* RIGHT */}
      <Handle id="right-target" type="target" position={Position.Right} />
      <Handle id="right-source" type="source" position={Position.Right} />

      {/* BOTTOM */}
      <Handle
        id="bottom-target"
        type="target"
        position={Position.Bottom}
        style={sharedStyle}
      />
      <Handle
        id="bottom-source"
        type="source"
        position={Position.Bottom}
        style={sharedStyle}
      />

      {/* LEFT */}
      <Handle id="left-target" type="target" position={Position.Left} />
      <Handle id="left-source" type="source" position={Position.Left} />
    </div>
  );
}
