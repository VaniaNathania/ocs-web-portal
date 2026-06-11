import Canvas from "./Canvas";

type CanvasSectionProps = {
  title: string;
  nodes: any[];
  edges: any[];
  height?: number | string;
  hint?: string;
};

const CanvasSection = ({
  title,
  nodes,
  edges,
  height = 200,
  hint,
}: CanvasSectionProps) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <span className="text-sm font-medium text-gray-600">{title}</span>

        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>

      <div className="bg-gray-50 p-2" style={{ height }}>
        <div className="h-full w-full overflow-hidden rounded-lg border border-dashed border-gray-300 bg-white">
          <Canvas nodes={nodes} edges={edges} />
        </div>
      </div>
    </div>
  );
};

export default CanvasSection;
