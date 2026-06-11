import { ChevronDown, ChevronRight } from "lucide-react";
import { TreeNode } from "./BuildTreeSidebar";
import { Dispatch, SetStateAction } from "react";
import { TreeNodeMain } from "./BuildTreeMain";

interface RenderNodeProps {
  node: TreeNode;
  level?: number;
  expanded: Record<string, boolean>;
  onToggle: (nodeId: string) => void;
  onSelect: (id: number) => void;
  selectedId: number | null;
  setSelectedItemMain: Dispatch<SetStateAction<TreeNodeMain | null>>;
}

const RenderNode: React.FC<RenderNodeProps> = ({ node, level = 0, expanded, onToggle, onSelect, selectedId, setSelectedItemMain }) => {
  const isExpanded = expanded[node.nodeId!] ?? false;
  const hasChildren = node.children.length > 0;
  if (!selectedId) return;
  const isSelected = selectedId === node.id;

  return (
    <div style={{ paddingLeft: level * 16 }}>
      <div className="flex flex-row items-center gap-1">
        {/* Chevron */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => {
              if (!node.nodeId) return;
              onToggle(node.nodeId);
            }}
            className="w-4 h-4 flex items-center justify-center"
          >
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <div className="w-4" />
        )}
        <span
          className={`p-1 m-1 w-full rounded-md text-sm cursor-pointer ${isSelected ? "bg-red-500 text-white" : "hover:bg-gray-200"}`}
          onClick={() => {
            if (!node.id) return;
            onSelect(node.id);
            setSelectedItemMain(null);
          }}
          onDoubleClick={() => {
            if (!node.nodeId) return;
            if (hasChildren) {
              onToggle(node.nodeId);
            }
          }}
        >
          {node.name}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children.map((child) => (
            <RenderNode key={child.nodeId} node={child} level={level + 1} expanded={expanded} onToggle={onToggle} onSelect={onSelect} selectedId={selectedId} setSelectedItemMain={setSelectedItemMain} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RenderNode;
