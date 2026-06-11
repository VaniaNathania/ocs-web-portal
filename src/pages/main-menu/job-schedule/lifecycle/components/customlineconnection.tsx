import React from "react";
import { getStraightPath } from "@xyflow/react";

function CustomConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
}: {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}) {
  const [edgePath] = getStraightPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <path fill="none" d={edgePath} />
    </g>
  );
}

export default CustomConnectionLine;
