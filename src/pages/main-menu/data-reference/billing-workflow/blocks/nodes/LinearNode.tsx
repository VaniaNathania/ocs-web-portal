import { Handle, Position } from "@xyflow/react";

const LinearNode = ({ data }: any) => {
  return (
    <div className="min-w-[160px] rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-sm font-medium text-gray-800">{data.label}</p>

      {/* Target (IN) */}
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />

      {/* Source (OUT) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-400"
      />
    </div>
  );
};

export default LinearNode;
